---
{
    "title": "statistics | Information Schema",
    "language": "en",
    "description": "The statistics table in information_schema provides MySQL-compatible metadata, always empty, for system compatibility.",
}
---

# statistics

## Overview

This table is solely for compatibility with MySQL behavior. It is always empty.

## Database


`information_schema`


## Table Information

| Column Name   | Type          | Description |
| ------------- | ------------- | ----------- |
| TABLE_CATALOG | varchar(512)  |             |
| TABLE_SCHEMA  | varchar(64)   |             |
| TABLE_NAME    | varchar(64)   |             |
| NON_UNIQUE    | bigint        |             |
| INDEX_SCHEMA  | varchar(64)   |             |
| INDEX_NAME    | varchar(64)   |             |
| SEQ_IN_INDEX  | bigint        |             |
| COLUMN_NAME   | varchar(64)   |             |
| COLLATION     | varchar(1)    |             |
| CARDINALITY   | bigint        |             |
| SUB_PART      | bigint        |             |
| PACKED        | varchar(10)   |             |
| NULLABLE      | varchar(3)    |             |
| INDEX_TYPE    | varchar(16)   |             |
| COMMENT       | varchar(16)   |             |
| INDEX_COMMENT | varchar(1024) |             |
