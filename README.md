# estafeta-api 

Esta es una API Rest hecha sobre Node.js para rastrear los envíos realizados por Estafeta.

## Instalación y uso
````
git clone https://github.com/davidmna/estafeta-api.git
cd estafeta-api
npm install
npm start
````

Una petición por `GET` a `http://localhost:3000/api/tracking/2806075762` muestra la siguiente respuesta:

````json
{
  "meta": {
    "code": 200
  },
  "data": {
    "tracking_number": "2806075762",
    "origin": "Guadalajara",
    "destination": "MEXICO D.F.",
    "service_type": null,
    "shipment_type": null,
    "shipment_weigth": null,
    "shipped_at": "2015-10-12 17:52:00",
    "expected_at": "2015-10-13",
    "delivered_at": "2015-10-13 13:48:00",
    "status": "delivered",
    "signed_by": "SDR:HUBERTO MORALES",
    "checkpoints_count": 9,
    "checkpoints": [
      {
        "description": "Envio recibido en oficina Av. Dr. Roberto Michel San Carlos GUADALAJARA",
        "comment": null,
        "checkpoint_at": "2015-10-12 17:52:00"
      },
      {
        "description": "Recolección en oficina por ruta local",
        "comment": null,
        "checkpoint_at": "2015-10-12 19:40:00"
      },
      {
        "description": "Recolección en oficina por ruta local",
        "comment": null,
        "checkpoint_at": "2015-10-12 20:23:00"
      },
      {
        "description": "Estación Aérea GDL ENTRADA A CONTENEDOR",
        "comment": "EMBARQUE AEREO ESTAFETA",
        "checkpoint_at": "2015-10-12 22:26:00"
      },
      {
        "description": "Centro de Int. SLP ENTRADA A CONTENEDOR",
        "comment": "EMBARQUE AEREO ESTAFETA",
        "checkpoint_at": "2015-10-13 01:55:00"
      },
      {
        "description": "MEXICO D.F. Llegada a centro de distribución MEX MEXICO D.F.",
        "comment": null,
        "checkpoint_at": "2015-10-13 06:20:00"
      },
      {
        "description": "MEXICO D.F. En proceso de entrega MEX MEXICO D.F.",
        "comment": null,
        "checkpoint_at": "2015-10-13 08:21:00"
      },
      {
        "description": "MEXICO D.F. MOVIMIENTO EN CENTRO DE DISTRIBUCION",
        "comment": "AUDITORIA A RUTA LOCAL",
        "checkpoint_at": "2015-10-13 09:01:00"
      },
      {
        "description": "Entregado",
        "comment": null,
        "checkpoint_at": "2015-10-13 13:48:00"
      }
    ]
  }
}
````

## Peticiones con números de rastreo inválidos
El número de rastreo no existe:
````json
{
  "meta": {
    "code": 404,
    "message": "Not found"
  }
}
````
El número de rastreo es muy viejo, Estafeta ya no guarda información:
````json
{
  "meta": {
    "code": 410,
    "message": "Expired"
  }
}
````

## Estatus del paquete

Se manejan 5 claves para el *status* del paquete: `processed`, `shipped`, `in_transit`, `out_for_delivery`, y `delivered`.
