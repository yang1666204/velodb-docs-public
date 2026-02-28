---
{
  "title": "Tableデータ表示Action",
  "language": "ja"
}
---
# Show Table Data Action

## Request

`GET /api/show_table_data`

## デスクリプション

すべての内部catalogの下にあるすべてのデータベースのすべてのTableのデータサイズ、または指定されたデータベースやTableのデータサイズを取得するために使用されます。単位はbyteです。
    
## Path parameters

NULL

## Query parameters

* `db`

    オプション。指定された場合、指定されたデータベースの下にあるTableのデータサイズを取得します。

* `table`

    オプション。指定された場合、指定されたTableのデータサイズを取得します。

* `single_replica`

    オプション。指定された場合、Tableの単一replicaのデータサイズを取得します。

## Request body

NULL

## Response

1. 指定されたデータベース内のすべてのTableのデータサイズ。

    ```
    {
        "msg":"success",
        "code":0,
        "data":{
            "tpch":{
                "partsupp":9024548244,
                "revenue0":0,
                "customer":1906421482
            }
        },
        "count":0
    }
    ```
2. 指定されたdbの指定されたTableのデータサイズ。

    ```
    {
        "msg":"success",
        "code":0,
        "data":{
            "tpch":{
                "partsupp":9024548244
            }
        },
        "count":0
    }
    ```
3. 指定されたデータベースの指定されたTableの単一レプリカのデータサイズ。

    ```
    {
        "msg":"success",
        "code":0,
        "data":{
            "tpch":{
                "partsupp":3008182748
            }
        },
        "count":0
    }
    ```
## Examples

1. 指定されたデータベース内のすべてのTableのデータサイズ。

    ```
    GET /api/show_table_data?db=tpch
    
    Response:
    {
        "msg":"success",
        "code":0,
        "data":{
            "tpch":{
                "partsupp":9024548244,
                "revenue0":0,
                "customer":1906421482
            }
        },
        "count":0
    }
    ```
2. 指定されたdbの指定されたTableのデータサイズ。

    ```
    GET /api/show_table_data?db=tpch&table=partsupp
        
    Response:
    {
        "msg":"success",
        "code":0,
        "data":{
            "tpch":{
                "partsupp":9024548244
            }
        },
        "count":0
    }
    ```
3. 指定されたdbの指定されたTableの単一レプリカのデータサイズ。

    ```
    GET /api/show_table_data?db=tpch&table=partsupp&single_replica=true
        
    Response:
    {
        "msg":"success",
        "code":0,
        "data":{
            "tpch":{
                "partsupp":3008182748
            }
        },
        "count":0
    }
    ```
