
## Clave de Acceso

### Tabla 1

|No     | Descripcion               | Tipo       | Formato          | Longitud  | Requisito     | tag             |
|:---   | :---:                     | :---:      | :---:            | :---:     | :---:         | :---:           |
| 1     | Fecha                     | Numerico   | ddmmaaaa         | 8         | Obligatorio   | <claveAcceso>   |
| 2     | Tipo Comprobante          | Numerico   | Tabla 3          | 2         | Obligatorio   | <claveAcceso>   |
| 3     | RUC                       | Numerico   | xxxxxxxxxx001    | 13        | Obligatorio   | <claveAcceso>   |
| 4     | Tipo Ambiente             | Numerico   | Tabla 4          | 1         | Obligatorio   | <claveAcceso>   |
| 5     | Serie                     | Numerico   | 001001           | 6         | Obligatorio   | <claveAcceso>   |
| 6     | Secuencial                | Numerico   | 000000001        | 9         | Obligatorio   | <claveAcceso>   |
| 7     | Codigo random             | Numerico   | Randomico        | 8         | Obligatorio   | <claveAcceso>   |
| 8     | Tipo Emision              | Numerico   | Tabla 2          | 1         | Obligatorio   | <claveAcceso>   |
| 9     | Verificador modulo 11     | Numerico   | Numerico         | 1         | Obligatorio   | <claveAcceso>   |

3101202601171600494800110011000000001563101156216

### Tabla 2

|No     | Tipo Emision      | Codigo    | Requisito     |
|:---   | :---:             | :---:     | :---:         |
|1      | Emision Normal    | 1         | Obligatorio   |


### Tabla 3

| No    | Comprobante               | Codigo| Requisito     | Tag       |
|:---   | :---:                     | :---: | :---:         | :---:     |
| 1     | Factura                   | 01    | Obligatorio   | <codDoc>  |
| 2     | Nota De Credito           | 01    | Obligatorio   | <codDoc>  |
| 3     | Nota De Debito            | 01    | Obligatorio   | <codDoc>  |
| 4     | Guia De Remision          | 01    | Obligatorio   | <codDoc>  |
| 5     | Comprobante De Retencion  | 01    | Obligatorio   | <codDoc>  |

### Tabla 4

|No     | Tipo de Ambiente  | Codigo    | Requisito     |
|:---   | :---:             | :---:     | :---:         |
| 1     | Pruebas           | 1         | Obligatorio   |
| 2     | Produccion        | 2         | Obligatorio   |