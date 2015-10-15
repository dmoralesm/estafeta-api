var express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    helpers = require('./utils'),
    conf = require('../config'),
    //bodyParser = require('body-parser'),
    port = conf.port;

var app = express();
//app.use(bodyParser.json());

app.get('/api/tracking/:tracking_number', function(req, res) {
  
  console.log('GET - Received tracking number', req.params.tracking_number);

  request.post({ 
    url:conf.estafeta_host, 
    encoding: 'binary', 
    form: { 
      dispatch: "doRastreoInternet", 
      tipoGuia: "REFERENCE", 
      guias: req.params.tracking_number, 
      idioma: "es" 
    }}, 
    function(err, httpResponse, body) {
      if(!err) {
        /* Check if tracking number exists */
        if (/No hay informaci.*n disponible\./i.test(body)) {
          res.status(404).send({
            meta: {
              code: 404,
              message: "Not found"
            }
          });
          return false;
        }
        
        console.log('Response: ', httpResponse.statusCode);
        var statusCode = httpResponse.statusCode;
        $ = cheerio.load(body, { normalizeWhitespace: true});

        var json_data = {},
            data = $('td[bgcolor=#edf0e9] div'),
            origin = data.eq(2).text(),
            destination = data.eq(3).text(),
            shipped_at = helpers.datetimeToIso(data.eq(13).text()),
            expected_at = data.eq(11).text(),
            delivered_at = (data.eq(9).text().trim() == "" ? null: helpers.datetimeToIso(data.eq(9).text().trim())),
            signed_by = (data.eq(6).text().trim() == "" ? null : data.eq(6).text().trim()),
            status = null;

        /* Check against DD/MM/YYYY date format */
        if ( /\d+\/\d+\/\d+\s*/i.test(expected_at) ) {
          expected_at = helpers.dateToIso(expected_at);
        } else {
          expected_at = null;
        }   

        var json_data = {
          meta: { code: statusCode },
          data: {
            tracking_number: req.params.tracking_number,
            origin: origin,
            destination: destination,
            service_type: null,
            shipment_type: null,
            shipment_weigth: null,
            shipped_at: shipped_at,
            expected_at: expected_at,
            delivered_at: delivered_at,
            status: null,
            signed_by: signed_by,
            checkpoints_count: 0,
            checkpoints: []
          }
        };
        
        var detail_tables = $('div.msg_list div.msg_body table'), detail_table;

        /* Find the table with the text "Lugar - Movimiento" */
        detail_tables.each(function(i, elem) {
          if( /Lugar - Movimiento/i.test($(this).html()) ) {
            detail_table = $(this);
            return false;
          }
        });

        //console.log(detail_table.html());

        var detail_rows = detail_table.find('tr');
        var detail_rows_length = detail_rows.length - 1;
        json_data.data.checkpoints_count = detail_rows_length;

        console.log('Total rows: '+ detail_rows_length);

        /* Ignore table header with i > 0 */
        for (var i = detail_rows_length; i > 0; i--) {
          //console.log('['+i+']'+detail_rows.eq(i).find('div').text());

          var description = detail_rows.eq(i).find('div').eq(1).text().trim();
          var comment = (detail_rows.eq(i).find('div').eq(2).text().trim() == "" ? null : detail_rows.eq(i).find('div').eq(2).text().trim());

          var checkpoint =  { 
            description: description,
            comment: comment,
            checkpoint_at: helpers.datetimeToIso(detail_rows.eq(i).find('div').eq(0).text().trim())
          };

          json_data.data.checkpoints.push(checkpoint);
        }

        /* Set status > */
        if ( /Entregado/i.test(data.eq(5).text()) ) {
          json_data.data.status = 'delivered';
        }

        if (!json_data.data.status) {

          if (detail_rows_length == 1) {
            json_data.data.status = "processed";
          }

          if (detail_rows_length == 2) {
            json_data.data.status = "shipped";
          }

          for (var i = 1; i <= detail_rows_length; i++) {
              var description = detail_rows.eq(i).find('div').text();

              if ( /Proceso de entrega/i.test(description) ) {
                json_data.data.status = "out_for_delivery";
                break;
              }

              if ( /Entrada a/i.test(description) ) {
                json_data.data.status = "in_transit";
                break;
              }
          }
        }
        /* < Set status */

        /* Add the last checkpoint when package is delivered */
        if( json_data.data.status == "delivered") {
          json_data.data.checkpoints_count+=1;
          json_data.data.checkpoints.push({ 
            description: "Entregado",
            comment: null,
            checkpoint_at: json_data.data.delivered_at
          });
        }


        /*
        detail_rows.each(function(i, elem) {
          console.log('['+i+']'+$(this).html());
        });
        */ 

        //res.header("Content-Type", "application/json; charset=utf-8");
        res.send(json_data);
      } else {
      console.log(err);
    }
    } 
  );
});

app.listen(port);
console.log('Server on', port);