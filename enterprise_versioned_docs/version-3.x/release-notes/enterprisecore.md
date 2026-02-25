---
{
    "title": "Enterprise Core",
    "description": "Release Date: October 25, 2025"
}
---

# Enterprise Core

## Enterprise Core 3.0.x

### Enterprise Core 3.0.10
Release Date: December 25, 2025

New Features

- Support function mmh64_v2

Improvements

- Improve Graceful Shutdown Behavior for BE and FE, and Optimize Query Retry During BE Shutdown
- Changed behavior: BE and FE now handle shutdown more gracefully, and queries are retried more intelligently during BE shutdown

Bug Fixes

- Forbid create mv with condition about value column on mow table
- Changed behavior: Creating materialized views with conditions about value columns on MoW tables is now forbidden
- Support `cloud_tablet_rebalancer_interval_second` config dynamic modification
- Changed behavior: The cloud_tablet_rebalancer_interval_second configuration can now be modified dynamically without restart
- Fix the issue where input rowsets are prematurely evicted after compaction, causing query failures
- Fix sync MV loss due to index change
- Fix an issue where some JSON paths could not be matched correctly
- Partition topn optimization requires all window expressions are in the same order
- Fix not in aggregate's output err after eliminate by uniform when group sets exist
- Fix execute err which throw eq function not exist exception when join reorder
- Fix aggregate function roll up fail when function is always nullable
- Fix create partition mv fail when contain cast and the cast target data type is same to cast source data type
- Fix the issue where it takes a long time to come alive on first boot
- Fixed uneven tablet performance during upgrades from older versions
- Fix s3 path with colon list error
- Fix SSL unwrap infinite loop on handshake failure
- Avoid coredump coz nullptr

### Enterprise Core 3.0.10
Release Date: November 20, 2025

New Features

- MaxCompute Catalog: Added support for reading project-schema-table structure in MaxCompute catalog
- Paimon Catalog: Added support for Paimon REST catalog with DLF integration
- JDBC Catalog: Added support for nvarchar data type in DM (Dameng) database

Improvements

- MTMV: Base table schema changes no longer cause nested MTMV to enter schema change status
- Routine Load: Optimized task scheduling by delaying schedule when transaction fails
- String Performance: Improved string serialization and deserialization performance
- I/O Optimization: Made read slice size configurable for better I/O tuning

Bug Fixes

Data Type

- Fixed unstable overflow error when casting decimal256 to float type
- Fixed incorrect auto-increment value assignment after FE checkpoint and restart

Function

- Fixed crash issue caused by explode function
- Fixed incorrect calculation result of timestampdiff function for datetimev1 type

Catalog

- Fixed NullPointerException issue in Iceberg catalog
- Fixed requirement validation for max_meta_object_cache_num configuration to ensure value is greater than 0
- Fixed issue where catalog was incorrectly removed from refresh queue during CREATE or ALTER operations
- Improved compatibility with different versions of zeroDateTimeBehavior=convertToNull writing method
- Fixed incorrect JDBC table ID assignment for query table-valued function

Nereids Optimizer

- Fixed memory leak by releasing physical plan in Profile.releaseMemory() method
- Enabled project merge capability for Java UDF
- Fixed ReorderJoin rule incorrectly absorbing mark join into multi join
- Fixed precision loss and null cast issues caused by simplify compare predicate optimization

MTMV

- Fixed refresh failure when partition table has no partitions

Export

- Fixed issue where export job might not be cancelled after encountering errors

HDFS

- Fixed backend core dump issue in HDFS reader during profile collection

Others

- Fixed show create view command not displaying column definitions
- Fixed kill connection command incorrectly terminating current connection
- Fixed issue where editlog could be written on non-master nodes

### Enterprise Core 3.0.9
Release Date: October 25, 2025

Behavior Changes
- Default to using zstd compression

- When using ranger / LDAP, creating users in VeloDB is no longer prohibited

- The `nested` attribute of `variant` is disabled by default. To enable it when creating a table, you need to first execute the following command in the session variable: `set enable_variant_flatten_nested = true`

New Features

- Added DM (Dameng) and KingBase JDBC Catalog support

- CSV export now supports compression

- Hive Catalog supports Presto View

- Support MySQL's `GROUP BY WITH ORDER` syntax

Improvements

- Backup meta info supports sizes exceeding 2GB

- During count(*), column pruning can select the smallest column in child nodes

- The show grant command can now be executed when LDAP is enabled

- Provided a mechanism for rolling upgrade of inverted index format V2 by partition, supporting users upgrading from version 2.1 to 3.0 to gradually complete index format migration

- Optimize the flushing strategy when memory is insufficient

- S3 Load and TVF support accessing publicly readable objects without AK/SK

- When the cache space is sufficient, the rowset generated by base compaction can be written to the file cache

- Optimize the `ALTER STORAGE VAULT` command, the `type` attribute can be automatically inferred without explicit specification

- Point queries will be planned to have only one fragment to improve the execution speed of point queries

- Improve the performance of unique key tables in point queries

- Optimize the additional resource consumption of common default tokenizers when writing non-tokenized indexes

Bug Fixes

Data Ingestion

- Fix the `enclose` parsing error when using multi-character column separators

- Fix the issue where S3 Load progress is not updated in a timely manner

- Fix the error when loading JSON boolean types into INT columns

- Fix the issue of missing error URL return in Stream Load

- Fix the issue where group commit is blocked after an exception is thrown in schema change

- Routine load now uses compute group name instead of compute group ID to select compute groups

- Fixed an issue where routine load would stop scheduling when memory limit is exceeded

Query Optimizer

- Fix the issue of incorrectly using colocate join in some self-join scenarios

- Fix the potential result error when `select distinct` is used with window functions

- Provide more user-friendly error messages when lambda expressions appear in unexpected positions

Permissions

- Fix the issue of incorrectly checking the permissions of base tables in views when querying external views

Query Execution

- Fix the issue that IPV6 type cannot parse IPV4 type data

- Fix the stack overflow error when parsing IPV6 type

- Fixed an issue where queries might fail in SSL mode

- Fixed an issue with type mismatch errors when importing data to tables with rollup

- Fixed an issue where topN queries might cause core dumps

- Fixed an issue with incorrect results from the array_agg_foreach function

Complex Data Types

- BE supports selecting the simdjson parser that matches the instruction set at startup

- Fix the incorrect type inference caused by data type conflicts in variant nested data types

- Fix the default value filling issue for variant nested top-level nested array data

- Prohibit building indexes on variant types in the cloud

- Fix the issue of generating empty index files when writing data that does not meet the index conditions after creating an inverted index for variant

- Fixed an issue where queries might crash after altering to add a variant type column

- Fixed an issue where variant type casts empty strings to NULL

- Fix array not supporting json subtype

- fix small file output with bz2 compression

- empty string should be cast to NULL(JSONB)

- resolve thread-safety issue caused by concurrent access to `_sub_column_tree`

Lakehouse

- Hive
  
  - Fixed failures when accessing Hive Metastore with Kerberos authentication in certain cases
  
  - Fixed an issue where the `serialization.null.format` property of Hive tables was not correctly recognized
  
  - Fixed an issue with duplicate partition IDs caused by Chinese characters in Hive table partitions
  
  - Fixed failures when writing to Hive tables stored in Alibaba Cloud OSS-HDFS

- Iceberg
  
  - Fix the failure issue when writing to iceberg tables with decimal partitions

- Paimon
  
  - Fixed an issue where timezone information was lost when reading Paimon data using JNI
  
  - Fixed an issue where lazy materialization optimization was not correctly triggered when reading Paimon tables

- Hudi
  
  - Fixed failures when reading Hudi table partition columns using JNI
  
  - Fix the query failure issue of Hudi table Timestamp type partition columns in some cases

- JDBC
  
  - Fixed an issue where certain reserved keywords caused access failures in JDBC Catalog
  
  - Fix the issue of JDBC SQL pass-through parsing failure in some cases

- MaxCompute
  
  - Fixed an issue where predicate pushdown could not find columns in MaxCompute Catalog
  
  - Fixed an issue preventing access to Alibaba Cloud International MaxCompute

- ES
  
  - Fixed an issue with incorrect handling of special time formats in ES Catalog

- Other
  
  - Fixed an issue where Database and Table IDs were generated incorrectly in External Catalog in certain cases

Others

- Fix the issue where new tablets are empty when cleaning up failed SC tasks

- Rebuild bucket columns in the original order

- Prohibit deleting bucket columns

- Support automatic retry in case of network errors

- Avoid deadlocks on `tabletInvertedIndex`

- Fixed an issue where FE might exit when concurrently creating and deleting tables and partitions with the same name

- Fixed an issue with incorrect reuse of schema change expressions

- Fixed an occasional load failure issue when auto-partitioning creates new partitions

- Fixed an issue that could cause coredump due to memory corruption

- Fixed an issue with errors when partitions or tables are deleted during backup

### Enterprise Core 3.0.7
Release Date: August 25, 2025

Behavior Changes
- Adjust the permission requirements for `show frontends` and `show backends` to align with the corresponding RESTful API, i.e., requiring the `SELECT_PRIV` permission on the `information_schema` database
- Admin and root users with specified domains are no longer considered system users 
- Storage: The default number of concurrent transactions per database is adjusted to 10000

New Features

- Query Optimizer
  - Support MySQL's aggregate roll-up syntax `GROUP BY ... WITH ROLLUP`
- Query Execution
  - `Like` statement supports `escape` syntax
- Semi-structured Data Management
  - Support building non-tokenized inverted indexes and ngram bloomfilter indexes only for new data by setting the session variable `enable_add_index_for_new_data=true` 
- New Functions
  - Added data functions: `cot`/`sec`/`cosec`

Improvements
- Data Ingestion
  - Optimize error message prompts for `SHOW CREATE LOAD`
- Primary Key Model
  - Add segment key bounds truncation capability to avoid single large import failures
- Storage
  - Enhance the reliability of compaction and imported data
  - Optimize balance speed
  - Optimize table creation speed 
  - Optimize compaction default parameters and observability 
  - Optimize the issue of query error -230 
  - Add system table `backend_tablets` 
  - Optimize the performance of querying `information_schema.tables` from follower nodes in cloud mode 
- Storage-Compute Decoupled
  - Enhance observability of Meta-service recycler
  - Support cross-compute group incremental preheating during import compaction 
  - Optimize Storage vault connectivity check
  - Support updating storage backend information via MS API 
- Lakehouse
  - Optimize ORC zlib decompression performance in x86 environment and fix potential issues 
  - Optimize the default number of concurrent threads for external table reading
  - Optimize error messages for Catalogs that do not support DDL operations
- Asynchronous Materialized Views
  - Optimize the performance of transparent rewriting planning
- Query Optimizer
  - The `group_concat` function now allows parameters of non-string types
  - The `sum` and `avg` functions allow parameters of non-numeric types 
  - Expand the scope of support for delayed materialization in TOP-N queries, enabling delayed materialization when querying partial columns
  - When creating partitions, list partitions allow inclusion of `MAX_VALUE`
  - Optimize the performance of sampling and collecting statistical information for aggregate model tables
  - Optimize the accuracy of NDV values when sampling and collecting statistical information 
- Inverted Index
  - Unify the order of properties displayed for inverted indexes in `show create table`
  - Add per-condition profile metrics (such as hit rows and execution time) for inverted index filter conditions to facilitate performance analysis
  - Enhance the display of inverted index-related information in profiles
- Permissions
  - Ranger supports setting permissions for storage vault and compute group

Bug Fixes

- Data Ingestion
  - Fix the correctness issue that may occur when importing CSV files with multi-character separators 
  - Fix the issue where the result of `ROUTINE LOAD` task display is incorrect after modifying task properties
  - Fix the issue where the one-stream multi-table import plan becomes invalid after primary node restart or Leader switch
  - Fix the issue where all scheduling tasks are blocked because `ROUTINE LOAD` tasks cannot find available BE nodes
  - Fix the concurrent read-write conflict issue of `runningTxnIds`
- Primary Key Model
  - Optimize the import performance of mow tables under high-frequency concurrent imports
  - mow table full compaction releases space of deleted data
  - Fix the potential import failure issue of mow tables in extreme scenarios
  - Optimize the compaction performance of mow tables
  - Fix the potential correctness issue of mow tables during concurrent imports and schema changes
  - Fix the issue where schema change on empty mow tables may cause import stuck or schema change failure
  - Fix the memory leak issue of mow delete bitmap cache
  - Fix the potential correctness issue of mow tables after schema change
- Storage
  - Fix the missing rowset issue in clone process caused by compaction
  - Fix the issue of inaccurate size calculation and default value for autobucket
  - Fix the potential correctness issue caused by bucket columns
  - Fix the issue where single-column tables cannot be renamed
  - Fix the potential memory leak issue of memtable 
  - Fix the inconsistent error reporting issue for unsupported operations in empty table transaction writes
- Storage-Compute Decoupled
  - Several fixes for File cache 
  - Fix the issue where cumulative point may roll back during schema process
  - Fix the issue where background tasks affect automatic restart
  - Fix the unhandled exception issue in data recycling process in azure environment 
  - Fix the issue where file cache is not cleaned up in time when compacting a single rowset 
- Lakehouse
  - Fix the transaction commit failure issue for Iceberg table writes in Kerberos environment 
  - Fix the query issue for hudi in kerberos environment 
  - Fix the potential deadlock issue in multi-Catalog scenarios
  - Fix the metadata inconsistency issue caused by concurrent Catalog refresh in some cases 
  - Fix the issue where ORC footer is read multiple times in some cases 
  - Fix the issue where Table Valued Function cannot read compressed json files
  - SQL Server Catalog supports identifying IDENTITY column information
  - SQL Convertor supports specifying multiple URLs for high availability
- Asynchronous Materialized Views
  - Fix the issue where partition compensation may be performed incorrectly when the query is optimized to an empty result set
- Query Optimizer
  - Fix the issue where factors other than `sql_select_limit` affect DML execution results 
  - Fix the issue where materialized CTEs may report errors in extreme cases when starting local shuffle
  - Fix the issue where prepared insert statements cannot be executed on non-master nodes 
  - Fix the result error issue when casting `ipv4` to string 
- Permissions
  - When a user has multiple roles, the permissions of the multiple roles will be merged before authorization 
- Query Execution
  - Fix issues with some json functions
  - Fix the potential BE Core issue when the asynchronous thread pool is full
  - Fix the incorrect result issue of `hll_to_base64` 
  - Fix the result error issue when casting `decimal256` to float 
  - Fix two memory leak issues
  - Fix the be core issue caused by `bitmap_from_base64`
  - Fix the potential be core issue caused by `array_map` function 
  - Fix the potential error issue of `split_by_regexp` function 
  - Fix the potential result error issue of `bitmap_union` function under extremely large data volumes 
  - Fix the potential core issue of `format round` function under some boundary values 
- Inverted Index
  - Fix the memory leak issue of inverted indexes in abnormal situations
  - Fix the error reporting issue when writing and querying empty index files
  - Capture IO exceptions in inverted index string reading to avoid process crash due to exceptions 
- Complex Data Types
  - Fix the potential type inference error when Variant Nested data types conflict
  - Fix the parameter type inference error of `map` function
  - Fix the issue where data is incorrectly converted to NULL when specifying `'$.'` as the path in jsonpath
  - Fix the issue where the serialization format cannot be restored when a subfield of Variant contains `.`
- Others
  - Fix the insufficient length issue of the IP field in the auditlog table
  - Fix the issue where the query id recorded in the audit log is that of the previous query when SQL parsing fails 


### Enterprise Core 3.0.6
Release Date: June 20, 2025

Behavior Changes
- Disallowed the use of time-series Compaction on Unique tables
- In storage-compute separation scenarios, the default Auto Bucket size is adjusted to 10GB

New Features
- Lakehouse
  - Supports accessing Iceberg table format in AWS S3 Table Buckets
- Storage
  - Object storage access supports IAM Role authorization, applicable to import/export, backup/restore, and storage-compute separation
- New Functions
  - json_extract_no_quotes
  - unhex_null
  - xpath_string
  - str_to_map
  - months_between
  - next_day
  - format_round

Improvements
- Import
  - Introduced blacklist mechanism: Prevents Routine Load from distributing metadata to unavailable BE nodes
  - Increased threshold for high-priority load: `load_task_high_priority_threshold_second` default value raised
- Primary Key Model
  - Reduced redundant log output
- Storage Optimization
  - Simplified Compaction Profile and logs
  - Improved scheduling strategy to enhance Compaction throughput
- Storage-Compute Separation
  - Startup Optimization: Accelerated File Cache initialization
  - Query Acceleration: Optimized File Cache query performance
  - Metadata Access Optimization: Addressed performance bottleneck caused by `get_version`
  - Faster Object Recycling: Improved garbage collection efficiency in separation mode
  - Stability Enhancement: Optimized retry strategy for object storage
  - Profile Granularity: Enhanced Tablet/Segment Footer-level metrics
  - Schema Change Fault Tolerance: Enabled New Tablet Compaction by default to avoid -230 error
- Lakehouse
  - Hive Catalog supports TTL control for partition cache (`partition.cache.ttl-second`)
  - Supports Hive table property `skip.header.line.count`
  - Compatible with Hive tables using `org.openx.data.jsonserde.JsonSerDe` format
  - Upgraded Paimon to version 1.0.1
  - Upgraded Iceberg to version 1.6.1
  - Supports Alibaba Cloud OSS-HDFS Root Policy
  - Dialect Compatibility: Returns Hive-formatted query results
  - See documentation: SQL Converter
- Asynchronous Materialized Views
  - Memory Optimization: Reduced memory usage in transparent rewrite
- Query Optimizer
  - Improved performance of bucket pruning
  - Enhanced Lambda expressions: Supports referencing external slots
- Query Execution
  - TopN Query Acceleration: Performance optimized for compute-storage separation
  - Function Extension: `substring_index` supports variable arguments
  - Geo Functions: Added ST_CONTAINS, ST_INTERSECTS, ST_TOUCHES, ST_DISJOINT
- Core Components
  - Memory Tracking Optimization: 10% performance improvement in high concurrency
  - Audit Log Enhancements: Limits INSERT statement length via `audit_plugin_max_insert_stmt_length`
  - See documentation: Audit Plugin
  - SQL Converter Controls: Added session variables `sql_convertor_config` and `enable_sql_convertor_features`
  - See documentation: SQL Converter

Bug Fixes
- Import
  - Fixed failure to clean BE transactions
  - Improved error accuracy in Routine Load tasks
  - Disallowed metadata task distribution to `disable_load=true` nodes
  - Fixed consumption offset rollback after FE restart
  - Resolved Core Dump caused by Group Commit conflicting with Schema Change
  - Fixed HTTPS protocol error in S3 Load
- Primary Key Model
  - Fixed key duplication caused by race conditions
- Storage
  - Resolved conflict between CCR and disk balancing
  - Fixed issue where default partition keys were not persisted
  - CCR now supports Rollup tables
  - Fixed `cooldown_ttl=0` boundary condition
  - Prevented data loss caused by GC and publish race
  - Fixed partition pruning failure in Delete Jobs
- Storage-Compute Separation
  - Fixed Schema Change blocking Compaction
  - Resolved object recycling failure when `storage_vault_prefix` is empty
  - Fixed query performance issues caused by Tablet Cache
  - Eliminated performance jitter from residual Tablet Cache
- Lakehouse
  - Resolved FE memory leaks
  - Prevented FE deadlock
  - JDBC Catalog supports compound condition pushdown
  - Fixed Deletion Vector read failure in Alibaba OSS Paimon tables
  - Supported comma-separated values in Hive table partitions
  - Fixed MaxCompute Timestamp column parsing
  - Trino Catalog now supports `information_schema` system tables
  - Fixed failure to read LZO-compressed files
  - Compatible with legacy ORC files
  - Fixed complex ORC type parsing errors
- Asynchronous Materialized Views
  - Fixed refresh issue when both `start_time` and immediate trigger are set
- Query Optimizer
  - Fixed Lambda expression rewrite error
  - Resolved Group By with constant key planning failure
  - Fixed constant folding logic
  - Completed system table metadata
  - Fixed NULL literal causing column type errors in View creation
- Query Execution
  - Resolved BE Core caused by illegal JSON import values
  - Fixed Intersect result error with NULL constant input
  - Corrected predicate execution on Variant types
  - Fixed `get_json_string` behavior with invalid JSON Path
  - Aligned JSON_REPLACE/INSERT/SET/ARRAY with MySQL behavior
  - Fixed Core on empty `array_map` parameter
  - Fixed Core on Variant to JSONB conversion
  - Added missing `explode_json_array_json_outer` function
  - Aligned results of `percentile` and `percentile_array`
  - Improved behavior of UTF8 encoding functions (`url_encode`, `strright`, `append_trail_char_if_absent`)
- Other
  - Fixed audit log loss under high concurrency
  - Resolved metadata replay failure caused by dynamic partitioned table creation
  - Prevented loss of Global UDF after restart
  - Aligned MySQL View metadata return format

### Enterprise Core 3.0.5
Release Date: May 30, 2025

New Features
- Lakehouse
  - FE Metrics now include Catalog/Database/Table count metrics
  - MaxCompute Catalog supports Timestamp type
- Query Execution
  - New URL functions: `top_level_domain`, `first_significant_subdomain`, `cut_to_first_significant_subdomain`
  - New function `year_of_week`, compatible with Trino syntax
  - `percentile_array` now supports Float and Double types
- Storage-Compute Separation
  - Supports renaming Compute Groups

Improvements
- Storage
  - Improved query performance in MOW (primary key) tables under high-frequency import
  - Enhanced Profile info display for Key Range queries
  - Stream Load supports importing compressed JSON files
  - Improved error messages in multiple import scenarios
  - Added various Routine Load monitoring metrics
  - Optimized Routine Load scheduling to avoid single-task failure impact
  - Added Routine Load system tables
  - Improved Compaction task generation performance
- Storage-Compute Separation
  - Fixed multiple File Cache stability and performance issues
  - Optimized Storage Vault creation validation logic
- Lakehouse
  - Optimized Trino Connector Catalog BE scanner close logic for faster memory release
  - ClickHouse JDBC Catalog auto-compatible with old and new drivers
- Asynchronous Materialized Views
  - Improved Transparent Rewrite planning performance
  - Optimized `tvf mv_infos` performance
  - Skipped Catalog metadata refresh when building MVs on external tables to save memory
- Query Optimizer
  - Improved performance for collecting statistics on key and partition columns
  - Maintained strict alias consistency in query results
  - Enhanced column pruning logic after extracting common subexpressions in aggregates
  - Improved error messages for function binding failures and unsupported subqueries
- Semi-structured Data
  - `json_object` now supports complex type arguments
  - Supports writing UInt128 into IPv6 type
  - Inverted index support for ARRAY fields in VARIANT
- Permissions
  - Improved Ranger authorization performance
- Others
  - Optimized JVM Metrics API performance



## Enterprise Core 2.1.x

### Enterprise Core 2.1.11

Release Date: August 18, 2025


Behavior Changes
- `time_series_max_tablet_version_num` controls the maximum number of versions for tables using the time - series compaction strategy.
- Fixed the issue where the HDFS root_path did not take effect during hot - cold tiering.
- In the new optimizer (Nereids), when the depth or width of an expression in a query exceeds the threshold limit, the query will not fall back to the old optimizer regardless of whether the fallback has started.
- Unified the name checking rules for enabling or disabling unicode names. Now, the non - unicode name rules are a strict subset of the unicode name rules.

New Features
- Query Execution Engine
  - Introduced the system table `routine_load_job` to view information about routine load jobs.
- Query Optimizer
  - Supported MySQL's GROUP BY roll - up syntax `GROUP BY ... WITH ROLLUP`.


Improvements
- Query Optimizer
  - Optimized the performance of collecting statistical information on aggregate model tables and primary key model MOR tables. 
- Asynchronous Materialized View
  - Optimized the planning performance of transparent rewriting. 
  - Optimized the refresh performance.


Bug Fixes

- Data Loading
  - Fixed the problem that the display result of `show` did not meet expectations after altering the attributes of `routineload`.
- Lakehouse Integration
  - Fixed the issue of incorrect data reading for Iceberg equality delete in certain cases.
  - Fixed the error of Iceberg Hadoop Catalog in the Kerberos environment. 
  - Fixed the problem of failed transaction submission when writing to Iceberg tables in the Kerberos environment. 
  - Fixed the error in transaction submission when writing to Iceberg tables.
  - Fixed the error when accessing Hudi tables in the Kerberos environment under certain circumstances.
  - SQL Server Catalog supports identifying IDENTITY column information.
  - Fixed the issue that Jdbc Catalog tables could not obtain row count information in some cases.
  - Optimized the decompression performance of ORC zlib in the x86 environment and fixed potential problems.
  - Added indicators related to Parquet/ORC condition filtering and delayed materialization in the Profile.
  - Optimized the reading performance of ORC Footer.
  - Fixed the problem that Table Valued Function could not read compressed JSON files.
  - Fixed the issue of inconsistent metadata caused by concurrent catalog refreshing in some cases.
- Index
  - Fixed the query error of the inverted index when processing IN predicates containing CAST operations to avoid returning incorrect query results.
  - Fixed the memory leak problem of the inverted index in abnormal execution situations.
- Semi-structured Data Type
  - Fixed the problem that some JSON functions returned incorrect results when dealing with null values.
  - Fixed some bugs related to JSON functions.
- Query Optimizer
  - Fixed the issue that the query could not continue execution when parsing a string into a date failed. 
  - Fixed the problem of incorrect constant folding results in individual scenarios.
  - Fixed the issue that individual array functions could not be planned normally when encountering null literals as input. 
  - Fixed the problem that enabling local shuffle might lead to incorrect results in extreme scenarios.
  - Fixed the issue that `replace view` might cause column information not to be visible when using `desc view`.
  - Fixed the problem that the `prepare command` might not be executed correctly on non - master FE nodes.
- Asynchronous Materialized View
  - Fixed the problem that query failure might occur after transparent rewriting when the data type of the base table column changes.
  - Fixed the problem of incorrect partition compensation in transparent rewriting in individual scenarios.
- Query Execution Engine
  - Fixed the problem that TopN calculation might core dump when encountering variant column types.
  - Fixed the problem that the function `bitmap_from_base64` would core dump when inputting incorrect data.
  - Fixed the problem of some incorrect results of the `bitmap_union` function when dealing with ultra - large amounts of data. 
  - Fixed the calculation error of `multi_distinct_group_concat` when used in window functions. 
  - Fixed the problem that the `array_map` function might core dump at extreme values. 
  - Fixed the problem of incorrect time zone handling.
- Others
  - Fixed the inconsistent behavior of multi - statements between the master FE and non - master FE.
  - Fixed the error of prepared statements on non - master FE.
  - Fixed the problem that the rollup operation might cause CCR interruption.

### Enterprise Core 2.1.10

May 20, 2025

Behavior Changes
- DELETE no longer incorrectly requires the SELECT_PRIV permission on the target table.
- Insert Overwrite no longer restricts concurrent operations on the same table to 1.
- Merge on write unique tables prohibit the use of time-series compaction.
- Building indexes on VARIANT type columns is prohibited.

New Features
- Query Execution Engine
  - Added support for more GEO type computation functions: ST_CONTAINS, ST_INTERSECTS, ST_TOUCHES, GeometryFromText, ST_Intersects, ST_Disjoint, ST_Touches.
  - Added support for the years_of_week function.
- Lakehouse
  - Hive Catalog now supports catalog-level partition cache control.


Improvements
- Lakehouse
  - Upgraded the Paimon dependency version to 1.0.1.
  - Upgraded the Iceberg dependency version to 1.6.1.
  - Included the memory overhead of Parquet Footer in the Memory Tracker to avoid potential OOM issues.
  - Optimized the predicate pushdown logic for JDBC Catalog, supporting pushdown of AND/OR connected predicates.
  - Precompiled versions now include the Jindofs extension package by default to support Alibaba Cloud oss-hdfs access.
- Semi-Structured Data Management
  - ANY function now supports JSON type.
  - JSON_REPLACE, JSON_INSERT, JSON_SET, JSON_ARRAY functions now support JSON data type and complex data types.
- Query Optimizer
  - When the number of options in an IN expression exceeds Config.max_distribution_pruner_recursion_depth, bucket pruning is not performed to improve planning speed.
- Storage Management
  - Reduced logging and improved some log messages.
- Other
  - Avoided the thrift rpc END_OF_FILE exception.

Bug Fixes
- Lakehouse
  - Fixed the issue where newly created tables in Hive were not immediately visible in Doris.
  - Fixed the error "Storage schema reading not supported" when accessing certain Text format Hive tables.
  - Refer to the get_schema_from_table documentation for details.
  - Fixed concurrency issues with metadata submission when writing to Hive/Iceberg tables.
  - Fixed the issue where writing to Hive tables stored on oss-hdfs failed.
  - Fixed the issue where accessing Hive tables with partition key values containing commas failed.
  - Fixed the issue where Split allocation for Paimon tables was uneven in certain cases.
  - Fixed the issue where Delete files were not correctly handled when reading Paimon tables stored on oss.
  - Fixed the issue where reading high-precision Timestamp columns in MaxCompute Catalog failed.
  - Fixed the potential resource leakage when deleting a Catalog in certain cases.
  - Fixed the issue where reading LZO compressed data failed in certain cases.
  - Fixed the issue where ORC deferred materialization caused errors when reading complex types.
  - Fixed the issue where reading ORC files generated by pyorc-0.3 version failed.
  - Fixed the issue where EXPORT operations caused metadata deadlocks.
- Indexing
  - Fixed errors in building inverted indexes after multiple add, delete, and rename column operations.
  - Added validation for unique column IDs in index compaction to avoid potential data anomalies and system errors.
- Semi-Structured Data Types
  - Fixed the issue where converting VARIANT type to JSON type returned NULL in certain cases.
  - Fixed the crash caused by JSONB CAST in certain cases.
  - Prohibited building indexes on VARIANT type columns.
  - Fixed the precision correctness of decimal type in the named_struct function.
- Query Optimizer
  - Fixed several issues in constant folding.
  - Common subexpression extraction may not work properly on lambda expressions.
  - Fixed the issue where eliminating constants in group by keys might not work properly.
  - Fixed the issue where planning failed in extreme scenarios due to incorrect statistics inference.
  - Fixed the issue where some information_schema tables depending on BE metadata could not retrieve complete data.
- Query Execution Engine
  - Fixed the issue where the explode_json_array_json_outer function was not found.
  - Fixed the issue where substring_index did not support dynamic parameters.
  - Fixed the issue where the st_contains function returned incorrect results in many cases.
  - Fixed the core dump issue that could be caused by the array_range function.
  - Fixed the issue where the date_diff function returned incorrect results.
  - Fixed a series of issues with string functions causing garbled output or incorrect results in non-ASCII encodings.
- Storage Management
  - Fixed the issue where metadata replay for dynamic partition tables failed in certain cases.
  - Fixed the issue where streamload on ARM might lose data due to operation sequence.
  - Fixed the error in full compaction and the potential issue of mow data duplication.
  - Fixed the issue where partition storage policy was not persisted.
  - Fixed the extremely rare issue where imported files did not exist.
  - Fixed the issue where ccr and disk balancing concurrency might cause files to go missing.
  - Fixed the connection reset issue that might occur during backup and restore of large snapshots.
  - Fixed the issue where FE follower lost local backup snapshots.
- Others
  - Fixed the issue where audit logs might be lost in certain scenarios.
  - Fixed the issue where the isQuery flag in audit logs might be incorrect.
  - Fixed the issue where some query sqlHash values in audit logs were incorrect.


### Enterprise Core 2.1.9

March 26, 2025

Behavior Changes
- The SQLHash in Audit Log is now accurately calculated per SQL query, resolving the issue of identical hashes in a single request.
- Query results match ColumnLabelName exactly.
- User property variables now take precedence over session variables.

New Features
- Storage Management
  - Disallow renaming partition columns.
- Others
  - Added FE monitoring metrics for Catalogs, Databases, and Tables counts.
Improvements
- Inverted Index
  - Support for ARRAY type in VARIANT inverted indexes.
  - Profile now shows performance metrics for each filter condition.
- Query Optimizer
  - Support for using SELECT * in aggregate queries with only aggregation key columns.
- Storage Management
  - Enhanced CCR for binlog recycling and small file transfer efficiency, and robustness in chaotic environments.
  - Enhanced import error messages to be more specific.
Bug Fixes
- Lakehouse
  - Fixed BE krb5.conf path configuration issue.
  - Prevented SELECT OUTFILE statement retries to avoid duplicate data export.
  - Fixed JAVA API access to Paimon tables.
  - Resolved writing to Hive tables with s3a:// storage location.
  - Fixed the issue of Catalog's Comment field not being persisted.
  - Addressed JDBC BE class loading leaks under certain conditions.
  - Resolved high version ClickHouse JDBC Driver compatibility with JDBC Catalog.
  - Fixed BE crash when reading Iceberg Position Delete.
  - Corrected reading MaxCompute table data under multi-partition columns.
  - Fixed reading Parquet complex column types errors.
- Inverted Index
  - Fixed ARRAY type inverted index null value handling.
  - Resolved BUILD INDEX exception for newly added columns.
  - Corrected UTF8 encoding index truncation issues leading to errors.
- Semi-structured Data Types
  - Fixed array_agg function crashes under special conditions.
  - Resolved JSON import crashes due to incorrect chunk parameters.
- Query Optimizer
  - Fixed constant folding issues with nested time functions like current_date.
  - Addressed non-deterministic function result errors.
  - Resolved CREATE TABLE LIKE execution issues with on update column properties.
  - Fixed unexpected planning errors for materialized views of aggregate model tables.
  - Resolved PreparedStatement exceptions due to internal ID overflow.
- Query Execution Engine
  - Resolved query hang or null pointer issues when querying system tables.
  - Added DOUBLE type support for LEAD/LAG functions.
  - Fixed query errors when case when conditions exceed 256.
  - Corrected str_to_date function errors with spaces.
  - Fixed split_part function errors during constant folding with ||.
  - Corrected log function result errors.
  - Resolved core dump issues with array / map functions in lambda expressions.
- Storage Management
  - Fixed memory corruption issues during import of aggregate tables.
  - Resolved occasional core dump during MoW import under memory pressure.
  - Fixed potential duplicate key issues with MoW during BE restart and schema change.
  - Corrected group commit and global column update issues with memtable promotion.
- Permission Management
  - No longer throws PartialResultException when using LDAP.

### Enterprise Core 2.1.8

January 24, 2025

Behavior Changes
- Add the environment variable SKIP_CHECK_ULIMIT to skip the ulimit value verification check within the BE process. This is only applicable to applications in the Docker quick - start scenario. 
- Add the enable_cooldown_replica_affinity session variable to control the selection of replica affinity for queries under cold - hot seperation.
- In FE, add the configurations restore_job_compressed_serialization and backup_job_compressed_serialization to solve the OOM problem of FE during backup and restore operations when the number of db tablets is extremely large. Downgrading is not possible after enabling these configurations.

New Features
- The Arrowflight protocol supports accessing BE through a load - balancing device. 
- Now lambda expressions support capturing external columns (#45186).

Improvements

- Lakehouse
  - Update the Hudi version to 0.15. And optimize the query planning performance of Hudi tables.
  - Optimize the read performance of MaxCompute partitioned tables.
  - Support the session variable enable_text_validate_utf8, which can ignore the UTF8 encoding detection in CSV format. 
  - Optimize the performance of Parquet file lazy materialization under high - filtering - rate conditions.

- Asynchronous Materialized Views
  - Now it supports manually refreshing partitions that do not exist in an asynchronous materialized view.
  - Optimize the performance of transparent rewrite planning .

- Query Optimizer
  - Improve the adaptive ability of runtime filters.
  - Add the ability to generate original column filter conditions from filter conditions on max/min aggregate function columns.
  - Add the ability to extract single - side filter conditions from join predicates.
  - Optimize the ability of predicate derivation on set operators to better generate filter predicates.
  - Optimize the exception handling ability of statistic information collection and usage to avoid generating unexpected execution plans when collection exceptions occur.

- Query Execution Engine
  - Optimize the execution of queries with limit to end faster and avoid unnecessary data scanning.

- Storage Management
  - CCR supports more comprehensive operations, such as rename table, rename column, modify comment, drop view, drop rollup, etc.
  - Improve the accuracy of the broker load import progress and the performance when importing multiple compressed files.
  - Improve the routine load timeout strategy and thread - pool usage to prevent routine load timeout failures and impacts on queries.

- Others
  - The Docker quick - start image supports starting without setting environment parameters. Add the environment variable SKIP_CHECK_ULIMIT to skip the start_be.sh script and the swap, max_map_count, ulimit - related verification checks within the BE process. This is only applicable to applications in the Docker quick - start scenario.
  - Add the new LDAP configuration ldap_group_filter for custom group filtering.
  - Optimize the performance when using ranger.
  - Fix the inaccurate statistics of scan bytes in the audit log.
  - Now, the default values of columns can be correctly displayed in the COLUMNS system table.
  - Now, the definition of views can be correctly displayed in the VIEWS system table.
  - Now, the admin user cannot be deleted.

Bug Fixes

- Lakehouse
  - Hive
    - Fix the problem of being unable to query Hive views created by Spark.
    - Fix the problem of being unable to correctly read some Hive Transaction tables.
    - Fix the problem of incorrect partition pruning when Hive table partitions contain special characters.
  - Iceberg
    - Fix the problem of being unable to create Iceberg tables in a Kerberos - authenticated environment.
    - Fix the problem of inaccurate count(*) queries when there are dangling deletes in Iceberg tables in some cases.
    - Fix the problem of query errors due to column name mismatches in Iceberg tables in some cases.
    - Fix the problem of being unable to read Iceberg tables when their partitions are modified in some cases.
  - Paimon
    - Fix the problem that the Paimon Catalog cannot access Alibaba Cloud OSS - HDFS.
  - Hudi
    - Fix the problem of ineffective partition pruning in Hudi tables in some cases.
  - JDBC
    - Fix the problem of being unable to obtain tables using the JDBC Catalog after enabling the case - insensitive table name feature in some cases.
  - MaxCompute
    - Fix the problem of ineffective partition pruning in MaxCompute tables in some cases.
  - Others
    - Fix the problem of FE memory leaks caused by Export tasks in some cases.
    - Fix the problem of being unable to access S3 object storage using the https protocol in some cases.
    - Fix the problem of the inability to automatically refresh Kerberos authentication tickets in some cases.
    - Fix the problem of errors when reading Hadoop Block compressed format files in some cases.
    - When querying ORC - formatted data, no longer push down CHAR - type predicates to avoid possible result errors.
- Asynchronous Materialized Views
  - Fix the problem that when there is a CTE in the materialized view definition, it cannot be refreshed.
  - Fix the problem that when columns are added to the base table, the asynchronous materialized view cannot hit the transparent rewrite.
  - Fix the problem that when the same filter predicate is included in different positions in a query, the transparent rewrite fails.
  - Fix the problem that when column aliases are used in filter predicates or join predicates, the transparent rewrite cannot be performed.
- Inverted Index
  - Fix the problem of abnormal handling of inverted index compaction
  - Fix the problem that inverted index construction fails due to lock - waiting timeout
  - Fix the problem of inverted index write crashes in abnormal situations
  - Fix the null - pointer problem of the match function with special parameters
  - Fix problems related to the variant inverted index and disable the use of the index v1 format for variants
  - Fix the problem of crashes when setting gram_size = 65535 for the ngram bloomfilter index
  - Fix the problem of incorrect calculation of DATE and DATETIME for the bloomfilter index
  - Fix the problem that dropping a column does not automatically drop the bloomfilter index
  - Reduce the memory footprint when writing the bloomfilter index
- Semi  Structure Data
  - Optimize memory usage and reduce the memory consumption of the variant data type
  - Optimize the performance of variant schema copy
  - Do not use variant as a key when automatically inferring tablet keys
  - Fix the problem of changing variant from NOT NULL to NULL
  - Fix the problem of incorrect type inference of lambda functions
  - Fix the coredump problem at the boundary conditions of the ipv6_cidr_to_range function
- Query Optimizer
  - Fix the potential deadlock problem caused by mutual exclusion of table read locks and optimize the lock - using logic.
  - Fix the problem that the SQL Cache function incorrectly uses constant folding, resulting in incorrect results when using functions containing time formats.
  - Fix the problem of incorrect optimization of comparison expressions in edge cases, which may lead to incorrect results.
  - Fix the problem of incorrect audit logs for high - concurrent point queries
  - Fix the problem of continuous error reporting after an exception occurs in high - concurrent point queries
  - Fix the problem of incorrect prepared statements for some fields
- Query Execution Engine
  - Fix the problem of incorrect results of regular expressions and like functions for special characters.
  - Fix the problem that the SQL Cache may have incorrect results when switching databases.
  - Fix the problem of incorrect results of the cut_ipv6 function.
  - Fix the problem of casting from numeric types to bool types.
  - Fix a series of problems related to arrow flight.
  - Fix the problem of incorrect results in some cases when the hash table of hashjoin exceeds 4G.
  - Fix the overflow problem of the convert_to function for Chinese characters.
- Storage Management
  - Fix the problem that high - concurrent DDL may cause FE startup failure.
  - Fix the problem that auto - increment columns may have duplicate values.
  - Fix the problem that routine load cannot use the newly expanded BE during expansion.
- Permission Management
  - Fix the problem of frequent access to the Ranger service when using Ranger as the authentication plugin.
- Others
  - Fix the potential memory leak problem when enable_jvm_monitor=true is enabled on the BE side.

### Enterprise Core 2.1.7

November 12, 2024

Behavior changes

- The following global variables will be forcibly set to the following default values:
  - enable_nereids_dml: true
  - enable_nereids_dml_with_pipeline: true
  - enable_nereids_planner: true
  - enable_fallback_to_original_planner: true
  - enable_pipeline_x_engine: true
- New columns have been added to the audit log.
  - For more information, please  refer to [docs](https://doris.apache.org/docs/admin-manual/audit-plugin/)

New features
- Async Materialized View
  - An asynchronous materialized view has added a property called use_for_rewrite to control whether it participates in transparent rewriting
- Query Execution
  - The list of changed session variables is now output in the Profile
  - Support for trim_in, ltrim_in, and rtrim_in functions has been added
  - Support for several URL functions (top_level_domain, first_significant_subdomain, cut_to_first_significant_subdomain) has been added
  - The bit_set function has been added
  - The count_substrings function has been added
  - The translate and url_encode functions have been added
  - The normal_cdf, to_iso8601, and from_iso8601_date functions have been added
  - Support for trim_in, ltrim_in, and rtrim_in functions has been added
- Storage Management
  - The information_schema.table_options and table_properties system tables have been added, supporting the querying of attributes set during table creation
  - Support for bitmap_empty as a default value has been implemented
  - A new session variable require_sequence_in_insert has been introduced to control whether a sequence column must be provided when performing INSERT INTO SELECT writes to a unique key table
- Others
  - Allow for generating flame graphs on the BE WebUI page

Improvements

- Lakehouse
  - Support for writing data to Hive text format tables. For more information, please refer to [docs](https://doris.apache.org/docs/dev/lakehouse/catalogs/hive-catalog#write-operations)
  - Access MaxCompute data using MaxCompute Open Storage API. For more information, please refer to [docs](https://doris.apache.org/docs/dev/lakehouse/catalogs/maxcompute-catalog/)
  - Support for Paimon DLF Catalog. For more information, please  refer to [docs](https://doris.apache.org/docs/dev/lakehouse/catalogs/paimon-catalog)
  - Added table$partitions syntax to directly query Hive partition information. For more information, please refer to [docs](https://doris.apache.org/docs/dev/lakehouse/catalogs/hive-catalog)
  - Support for reading Parquet files in brotli compression format
  - Support for reading DECIMAL 256 types in Parquet files
  - Support for reading Hive tables in OpenCsvSerde format
- Async Materialized View
  - Refined the granularity of lock holding during the build process for asynchronous materialized views
- Query optimizer
  - Improved the accuracy of statistic information collection and usage in extreme cases to enhance planning stability.
  - Runtime filters can now be generated in more scenarios to improve query performance. 
  - Enhanced constant folding capabilities for numerical, date, and string functions to boost query performance.
  - Optimized the column pruning algorithm to enhance query performance.
- Query Execution
  - Supported parallel preparation to reduce the time consumed by short queries.
  - Corrected the names of some counters in the profile to match the audit logs.
  - Added new local shuffle rules to speed up certain queries. 
- Storage Management
  - The SHOW PARTITIONS command now supports displaying the commit version.
  - Checked for unreasonable partition expressions when creating tables. 
  - Optimized the scheduling logic when encountering EOF in Routine Load.
  - Made Routine Load aware of schema changes.
  - Improved the timeout logic for Routine Load tasks.
- Others
  - Allowed closing the built-in service port of BRPC via BE configuration.
  - Fixed issues with missing fields and duplicate records in audit logs.


Bug fixes

- Lakehouse
  - Fixed the inconsistency in the behavior of INSERT OVERWRITE with Hive.
  - Cleaned up temporarily created folders to address the issue of too many empty folders on HDFS.
  - Resolved memory leaks in FE caused by using the JDBC Catalog in some cases.
  - Resolved memory leaks in BE caused by using the JDBC Catalog in some cases.
  - Fixed errors in reading Snappy compressed formats in certain scenarios.
  - Addressed potential FileSystem leaks on the FE side in certain scenarios.
  - Resolved issues where using EXPLAIN VERBOSE to view external table execution plans could cause null pointer exceptions in some cases.
  - Fixed the inability to read tables in Paimon parquet format.
  - Addressed performance issues introduced by compatibility changes in the JDBC Oracle Catalog.
  - Disabled predicate pushing down after implicit conversion to resolve incorrect query results in some cases with JDBC Catalog.
  - Fixed issues with case-sensitive access to table names in the External Catalog.
- Async Materialized View
  - Fixed the issue where user-specified start times were not effective.
  - Resolved the issue of nested materialized views not refreshing.
  - Fixed the issue where materialized views might not refresh after the base table was deleted and recreated.
  - Addressed issues where partition compensation rewrites could lead to incorrect results.
  - Fixed potential errors in rewrite results when sql_select_limit was set.
- Semi-Structured Data Management
  - Fixed the issue of index file handle leaks.
  - Addressed inaccuracies in the count() function of inverted indexes in special cases.
  - Fixed exceptions with variant when light schema change was not enabled.
  - Resolved memory leaks when variant returns arrays.
- Query optimizer
  - Corrected potential errors in nullable calculations for filter conditions during external table queries, leading to execution exceptions.
  - Fixed potential errors in optimizing range comparison expressions.
- Query Execution
  - The match_regexp function could not correctly handle empty strings.
  - Resolved issues where the scanner thread pool could become stuck in high-concurrency scenarios.
  - Fixed errors in the results of the data_floor function.
  - Addressed incorrect cancel messages in some scenarios.
  - Fixed issues with excessive warning logs printed by arrow flight.
  - Resolved issues where runtime filters failed to send in some scenarios.
  - Fixed problems where some system table queries could not end normally or became stuck.
  - Addressed incorrect results from window functions.
  - Fixed issues where the encrypt and decrypt functions caused BE cores.
  - Resolved errors in the results of the conv function.
- Storage Management
  - Fixed import failures when Memtable migration was used in multi-replica scenarios with machine crashes.
  - Addressed inaccurate memory statistics during the Memtable flush phase during imports.
  - Fixed fault tolerance issues with Memtable migration in multi-replica scenarios.
  - Resolved inaccurate bvar statistics with Memtable migration.
  - Fixed inaccurate progress reporting for S3 loads.
- Permissions
  - Fixed permission issues related to show columns, show sync, and show data from db.table.
- Others
  - Fixed the issue where the audit log plugin for version 2.0 could not be used in version 2.1.

### Enterprise Core 2.1.7-rc01

September 13, 2024

New features

* Storage Management: Added the `information_schema.table_options` and `table_properties` system tables to support querying some attributes set during table creation; Introduced support for `bitmap_empty` as a default value.

Improvements

* Query Execution: Enhanced parallel prepare support to reduce latency for short queries.
* Storage Management: The `Show Partitions` command now supports displaying the commit version; Added validation for unreasonable partition expressions during table creation.

Bug fixes

* Lakehouse: Fixed the inconsistency in `insert overwrite` behavior with Hive; Added additional checks when creating external DLF tables to prevent errors during queries; Cleaned up temporarily created folders to address the issue of too many empty folders on HDFS.
* Async Materialized View: Resolved the issue where the user-specified `start time` did not take effect; Fixed the issue of nested materialized views not refreshing.
* Query Execution: Addressed the issue where the `match_regexp` function could not properly handle empty strings; Solved the issue of scanner thread pool getting stuck in high concurrency scenarios.
* Storage Management: Fixed the issue of import failures during Memtable migration in multi-replica scenarios when a machine goes down; Addressed the issue of inaccurate memory statistics during the Memtable flush phase during imports.
* Permissions: Fixed permission issues related to `show columns`, `show sync`, and `show data from db.table`.

### Enterprise Core 2.1.6

September 13, 2024

Behavior changes

* Removed the `delete_if_exists` option from create repository.
* Added the `enable_prepared_stmt_audit_log` session variable to control whether JDBC prepared statements record audit logs, with the default being no recording.
* Implemented fd limit and memory constraints for segment cache.
* When the FE configuration item `sys_log_mode` is set to BRIEF, file location information is added to the logs.
* Changed the default value of the session variable `max_allowed_packet` to 16MB.
* When a single request contains multiple statements, semicolons must be used to separate them.
* Added support for statements to begin with a semicolon.
* Aligned type formatting with MySQL in statements such as `show create table`.
* When the new optimizer planning times out, it no longer falls back to prevent the old optimizer from using longer planning times.

New features

* Lakehouse: Supported writeback for Iceberg tables. SQL interception rules now support external tables. Added the system table `file_cache_statistics` to view BE data cache metrics.
* Async Materialized View: Supported transparent rewriting during inserts.Supported transparent rewriting when variant types exist in queries.
* Semi-Structured Data Management: Supported casting ARRAY MAP to JSON type.Supported the `json_keys` function. Supported specifying the JSON path $. when importing JSON. ARRAY, MAP, STRUCT types now support `replace_if_not_null`. ARRAY, MAP, STRUCT types now support adjusting column order. Added the `multi_match` function to match keywords across multiple fields, with support for inverted index acceleration.
* Query Optimizer: Filled in the original database name, table name, column name, and alias for returned columns in the MySQL protocol.  Supported the aggregation function `group_concat` with both order by and distinct simultaneously. SQL cache now supports reusing cached results for queries with different comments. In partition pruning, supported including `date_trunc` and date functions in filter conditions. Allowed using the database name where the table resides as a qualifier prefix for table aliases. Supported hint-style comments.
* Others: Added the system table `table_properties` for viewing table properties. Introduced deadlock and slow lock detection in FE. 

Improvements

* Lakehouse: Reimplemented the external table metadata caching mechanism. Added the session variable `keep_carriage_return` with a default value of false. By default, reading Hive Text format tables treats both `\r\n` and `\n` as newline characters. Optimized memory statistics for Parquet/ORC file read/write operations. Supported pushing down IN/NOT IN predicates for Paimon tables. Enhanced the optimizer to support Time Travel syntax for Hudi tables. Optimized Kerberos authentication-related processes. Enabled reading Hive tables after renaming column operations. Optimized the reading performance of partition columns for external tables. Improved the data shard merging strategy during external table query planning to avoid performance degradation caused by a large number of small shards. Added attributes such as location to `SHOW CREATE DATABASE/TABLE`. Supported complex types in MaxCompute Catalog. Optimized the file cache loading strategy by using asynchronous loading to avoid long BE startup times. Improved the file cache eviction strategy, such as evicting locks held for extended periods.
* Async Materialized View: Supported hourly, weekly, and quarterly partition roll-up construction. For materialized views based on Hive external tables, the metadata cache is now updated before refresh to ensure the latest data is obtained during each refresh. Improved the performance of transparent rewrite planning in storage-compute decoupled mode by batch fetching metadata. Enhanced the performance of transparent rewrite planning by prohibiting duplicate enumerations. Improved the performance of transparent rewrite for refreshing materialized views based on Hive external table partitions.
* Semi-Structured Data Management: Optimized memory allocation for TOPN queries to improve performance. Enhanced the performance of string processing in inverted indexes. Optimized the performance of inverted indexes in MOW tables. Supported specifying the row-store `page_size` during table creation to control compression effectiveness.
* Query Optimizer: Adjusted the row count estimation algorithm for mark joins, resulting in more accurate cardinality estimates for mark joins. Optimized the cost estimation algorithm for semi/anti joins, enabling more accurate selection of semi/anti join orders. Adjusted the filter estimation algorithm for cases where some columns have no statistical information, leading to more accurate cardinality estimates. Modified the instance calculation logic for set operation operators to prevent insufficient parallelism in extreme cases. Adjusted the usage strategy of bucket shuffle, achieving better performance when data is not sufficiently shuffled. Enabled early filtering of window function data, supporting multiple window functions in a single projection. When a `NullLiteral` exists in a filter condition, it can now be folded into false, further converted to an `EmptySet` to reduce unnecessary data scanning and computation. Expanded the scope of predicate derivation, reducing data scanning in queries with specific patterns. Supported partial short-circuit evaluation logic in partition pruning to improve partition pruning performance, achieving over 100% improvement in specific scenarios. Enabled the computation of arbitrary scalar functions within user variables. Maintained error messages consistent with MySQL when alias conflicts exist in queries.
* Query Execution: Adapted AggState for compatibility from 2.1 to 3.x and fixed coredump issues. Refactored the strategy selection for local shuffle when no joins are involved. Modified the scanner for internal table queries to an asynchronous approach to prevent blocking during internal table queries. Optimized the block merge process when building hash tables in Join operators. Reduced the lock holding time for MultiCast operations. Optimized gRPC's keepAliveTime and added a connection monitoring mechanism, reducing the probability of query failures due to RPC errors during query execution. Cleaned up all dirty pages in jemalloc when memory limits are exceeded. Improved the performance of `aes_encrypt`/`decrypt` functions when handling constant types. Optimized the performance of `json_extract` functions when processing constant data. Optimized the performance of ParseURL functions when processing constant data.
* Backup Recovery / CCR: Restore now supports deleting redundant tablets and partition options. Check storage connectivity when creating a repository. Enables binlog to support `DROP TABLE`, allowing CCR to incrementally synchronize `DROP TABLE` operations.
* Compaction: Improves the issue where high-priority compaction tasks were not subject to task concurrency control limits. Automatically reduces compaction memory consumption based on data characteristics. Fixes an issue where the sequential data optimization strategy could lead to incorrect data in aggregate tables or MOR UNIQUE tables. Optimizes the rowset selection strategy during compaction during replica replenishment to avoid triggering -235 errors.
* MOW (Merge-On-Write): Optimizes slow column updates caused by concurrent column updates and compactions. Fixes an issue where segcompaction during bulk data imports could lead to incorrect MOW data. Fixes data loss in column updates that may occur after BE restarts.
* Storage Management: Adds FE configuration to control whether queries under hot-cold tiering prefer local data replicas. Optimizes expired BE report messages to include newly created tablets. Optimizes replica scheduling priority strategy to prioritize replicas with missing data. Prevents tablets with unfinished ALTER jobs from being balanced. Enables modifying the number of buckets for tables with list partitioning. Prefers querying from online disk services. Improves error messages for materialized view base tables that do not support deletion during synchronization. Improves error messages for single columns exceeding 4GB. Fixes an issue where aborted transactions were omitted when plan errors occurred during `INSERT` statements. Fixes exceptions during SSL connection closure. Fixes an issue where table locks were not held when aborting transactions using labels. Fixes `gson pretty` causing large image issues. Fixes an issue where the new optimizer did not check for bucket values of 0 in `CREATE TABLE` statements. Fixes errors when Chinese column names are included in `DELETE` condition predicates. Fixes frequent tablet balancing issues in partition balancing mode.Fixes an issue where partition storage policy attributes were lost. Fixes incorrect statistics when importing multiple tables within a transaction. Fixes errors when deleting random bucket tables. Fixes issues where FE fails to start due to non-existent UDFs. Fixes inconsistencies in the last failed version between FE master and slave. Fixes an issue where related tablets may still be in schema change state when schema change jobs are canceled. Fixes errors when modifying type and column order in a single statement schema change (SC).
* Data Loading: Improves error messages for -238 errors during imports. Allows importing to other partitions while restoring a partition. Optimizes the strategy for FE to select BEs during group commit. Avoids printing stack traces for some common streamload error messages.  Improves handling of issues where offline BEs may affect import errors.
* Permissions: Optimizes access performance after enabling the Ranger authentication plugin. Optimizes permission strategies for Refresh Catalog/Database/Table operations, allowing users to perform these operations with only SHOW permissions.

Bug fixes

* Lakehouse: Fixes the issue where switching catalogs may result in an error of not finding the database. Addresses exceptions caused by attempting to read non-existent data on S3. Resolves the issue where specifying an abnormal path during export operations may lead to incorrect export locations. Fixes the timezone issue for time columns in Paimon tables. Temporarily disables the Parquet PageIndex feature to avoid certain erroneous behaviors. Corrects the selection of Backend nodes in the blacklist during external table queries. Resolves errors caused by missing subcolumns in Parquet Struct column types. Addresses several issues with predicate pushdown in JDBC Catalog. Fixes issues where some historical Parquet formats led to incorrect query results.
* Async Materialized View: Fixes the inability to use `SHOW CREATE MATERIALIZED VIEW` on follower FEs. Unifies the object type of asynchronous materialized views in metadata as tables to enable proper display in data tools. Resolves the issue where nested asynchronous materialized views always perform full refreshes. Fixes the issue where canceled tasks may show as running after restarting FEs. Addresses incorrect use of contexts, which may lead to unexpected failures of materialized view refresh tasks. Resolves issues that may cause varchar type write failures due to unreasonable lengths when creating asynchronous materialized views based on external tables. Fixes the potential invalidation of asynchronous materialized views based on external tables after FE restarts or catalog rebuilds. Prohibits the use of partition rollup for materialized views with list partitions to prevent the generation of incorrect data.
* Semi-Structured Data Management: Removes support for prepared statements in the old optimizer. Fixes issues with JSON escape character handling. Resolves issues with duplicate processing of JSON fields. Fixes issues with some ARRAY and MAP functions. Resolves complex combinations of inverted index queries and LIKE queries.
* Query Optimizer: Fixed the potential partition pruning error issue when the 'OR' condition exists in partition filter conditions. Fixed the potential partition pruning error issue when complex expressions are involved. Fixed the issue where nullable in `agg_state` subtypes might be planned incorrectly, leading to execution errors. Fixed the issue where nullable in set operation operators might be planned incorrectly, leading to execution errors. Fixed the incorrect execution priority issue of intersect operator. Fixed the NPE issue that may occur when the maximum valid date literal exists in the query. Fixed the occasional planning error that results in an illegal slot error during execution.
* Query Execution: Fixed the issue where the pipeline execution engine gets stuck in multiple scenarios, causing queries not to end. Fixed the coredump issue caused by null and non-null columns in set difference calculations. Fixed the incorrect result issue of the `width_bucket` function. Fixed the query error issue when a single row of data is large and the result set is also large (exceeding 2GB). Fixed the incorrect result issue of `stddev` with DecimalV2 type. Fixed the coredump issue caused by the `MULTI_MATCH_ANY` function. Fixed the issue where `insert overwrite auto partition` causes transaction rollback.
* Backup & Recovery / CCR: Fixed the issue where the data version after backup and recovery may be incorrect, leading to unreadability. Fixed the issue of using restore version across versions. Fixed the issue where the job is not canceled when backup fails. Fixed the NPE issue in ccr during the upgrade from 2.1.4 to 2.1.5, causing the FE to fail to start. Fixed the issue where views and materialized views cannot be used after restoration.
* Storage Management: Fixed possible memory leaks in routine load when loading multiple tables from a single stream. Fixed the issue where delimiters and escape characters in routine load were not effective. Fixed incorrectly show routine load results when the routine load task name contained uppercase letters. Fixed the issue where the offset cache was not reset when changing the routineload topic. Fixed the potential exception triggered by show routineload under concurrent scenarios. Fixed the issue where routine load might import data repeatedly.
* Data Exporting: Fixed the issue where enabling the delete_existing_files property during export operations might result in duplicate deletion of exported data.
* Permissions: Fixed the incorrect requirement of ALTER TABLE permission when creating a materialized view. Fixed the issue where the db was explicitly displayed as empty when showing routine load. Fixed the incorrect requirement of CREATE permission on the original table when using CREATE TABLE LIKE. Fixed the issue where grant operations did not check if the object existed.

### Enterprise Core 2.1.5

July 25, 2024

Behavior changes

* The default connection pool size for the JDBC Catalog has been increased from 10 to 30 to prevent connection exhaustion in high-concurrency scenarios.
* The system's reserved memory (low water mark) has been adjusted to min(6.4GB, MemTotal * 5%) to mitigate BE OOM issues.
* When processing multiple statements in a single request, only the last statement's result is returned if the CLIENT_MULTI_STATEMENTS flag is not set.
* Direct modifications to data in asynchronous materialized views are no longer permitted.
* A session variable use_max_length_of_varchar_in_ctas has been added to control the behavior of varchar and char type length generation during CTAS (Create Table As Select). The default value is true. When set to false, the derived varchar length is used instead of the maximum length.
* Statistics collection now defaults to enabling the functionality of estimating the number of rows in Hive tables based on file size.
* Transparent rewrite for asynchronous materialized views is now enabled by default.
* Transparent rewrite utilizes partitioned materialized views. If partitions fail, the base tables are unioned with the materialized view to ensure data correctness. 

New features

* Lakehouse: The session variable read_csv_empty_line_as_null can be used to control whether empty lines are ignored when reading CSV format files. By default, empty lines are ignored. When set to true, empty lines will be read as rows where all columns are null.Compatibility with Presto's complex type output format can be enabled by setting serde_dialect="presto".
* Multi-Table Materialized View: Supports non-deterministic functions in materialized view building. Atomically replaces definitions of asynchronous materialized views. Views creation statements can be viewed via SHOW CREATE MATERIALIZED VIEW. Transparent rewrites for multi-dimensional aggregation and non-aggregate queries. Supports DISTINCT aggregations with key columns and partitioning for roll-ups. Support for partitioning materialized views to roll up partitions using date_trunc. Partitioned table-valued functions (TVFs) are supported.
* Semi-Structured Data Management: Tables using the VARIANT type now support partial column updates. PreparedStatement support is now enabled by default. The VARIANT type can be exported to CSV format. explode_json_object function transposes JSON Object rows into columns. The ES Catalog now maps ES NESTED or OBJECT types to the Doris JSON type. By default, support_phrase is enabled for inverted indexes with specified analyzers to improve the performance of match_phrase series queries.
* Query Optimizer: Support for explaining DELETE FROM statements. Support for hint form of constant expression parameters.
Memory Management: Added an HTTP API to clear the cache. 
Permissions: Support for authorization of resources within Table-Valued Functions (TVFs).

Improvements

* Lakehouse: Upgraded Paimon to version 0.8.1.Fixes ClassNotFoundException for org.apache.commons.lang.StringUtils when querying Paimon tables.Added support for Tencent Cloud LakeFS. Optimized the timeout duration when fetching file lists for external table queries. Configurable via the session variable fetch_splits_max_wait_time_ms. Improved default connection logic for SQLServer JDBC Catalog.Added serde properties to the show create table statements for Hive tables.Changed the default cache time for Hive table lists on the FE from 1 day to 4 hours. Data export (Export/Outfile) now supports specifying compression formats for Parquet and ORC.When creating a table using CTAS+TVF, partition columns in the TVF are automatically mapped to Varchar(65533) instead of String, allowing them to be used as partition columns for internal tables. Optimized the number of metadata accesses for Hive write operations. ES Catalog now supports mapping nested/object types to Doris's Json type. Improved error messages when connecting to Oracle using older versions of the ojdbc driver. When Hudi tables return an empty set during Incremental Read, Doris now also returns an empty set instead of error. Fixed an issue where inner-outer table join queries could lead to FE timeouts in some cases. Fixed an issue with FE metadata replay errors during upgrades from older versions to newer versions when the Hive metastore event listener is enabled.
* Multi-Table Materialized View: Automate key column selection for asynchronous materialized views. Support date_trunc in materialized view partition definitions. Enable transparent rewrites across nested materialized view aggregations. Asynchronous materialized views remain available when schema changes do not affect the correctness of their data. Improve planning speed for transparent rewrites. When calculating the availability of asynchronous materialized views, the current refresh status is no longer taken into account.
* Semi-Structured Data Management: Optimize DESC performance for viewing VARIANT sub-columns through sampling. Support for special JSON data with empty keys in the JSON type.
* Inverted Index: Reduce latency by minimizing the invocation of inverted index exists to avoid delays in accessing object storage.Optimize the overhead of the inverted index query process.Prevent inverted indices in materialized views.
* Query Optimizer: When both sides of a comparison expression are literals, the string literal will attempt to convert to the type of the other side. Refactored the sub-path pushdown functionality for the variant type, now better supporting complex pushdown scenarios. Optimized the logic for calculating the cost of materialized views, enabling more accurate selection of lower-cost materialized views. Improved the SQL cache planning speed when using user variables in SQL. Optimized the row estimation logic for NOT NULL expressions, resulting in better performance when NOT NULL is present in queries. Optimized the null rejection derivation logic for LIKE expressions. Improved error messages when querying a specific partition fails, making it clearer which table is causing the issue.
* Query Execution: Improved the performance of the bitmap_union operator up to 3 times in certain scenarios.Enhanced the reading performance of Arrow Flight in ARM environments.Optimized the execution performance of the explode, explode_map, and explode_json functions.
* Data Loading: Support setting max_filter_ratio for INSERT INTO ... FROM TABLE VALUE FUNCTION

Bug fixes

* Various issues have been fixed in areas such as lakehouse, multi-table materialized view, semi-structured data analysis, inverted index, query optimizer, query execution and storage management.


### Enterprise Core 2.1.4

June 27, 2024

* Query optimizer supports the FE Flame Graph tool, simultaneous use of SELECT DISTINCT with aggregate functions, rewriting single-table queries without GROUP BY, and high-concurrency point queries.
* Lakehouse integration supports Paimon's native reader to handle Deletion Vectors, using Resources in Table-Valued Functions (TVF), and achieving data masking through the Ranger plugin.
* Asynchronous materialized view construction now supports partition roll-up, trigger-based updates, specifying store_row_column and Storage Medium, and transparent rewriting supports single-table asynchronous materialized views and AGG_STATE type aggregate roll-up.
* Other feature enhancements include the addition of the replace_empty function, support for the show storage policy using statement, and JVM metrics on the BE side.
* Several optimizations have been made, including improving the accuracy of memory estimation consumed by the Segment Cache and supporting the creation of inverted indexes for Chinese column names.
* Various issues have been fixed in areas such as the query optimizer, query execution, materialized views, and semi-structured data analysis.

### Enterprise Core 2.1.3

May 17, 2024

* Support INSERT INTO hive table in Hive Catalog.
* Add show views statement to query views.
* Workload group support bind to specific BE hosts.
* Broker Load spport compressed JSON format.
* Truncate function can use column as scale argument.
* Add new function uuid_to_int and int_to_uuid.
* Support create mtmv based on other mtmv.
* Support rewrite by mv nested materialized view.
* Add BypassWorkloadGroup to pass query queue.
* Add function strcmp.
* Support hll functions hll_from_base64, hll_to_base64.

### Enterprise Core 2.1.2

April 18, 2024

* Add processlist table in information_schema database, users could use this table to query active connections.
* Add a new table valued function LOCAL to allow access file system like shared storage.
* Set the default value of the data_consistence property of EXPORT to partition to make export more stable during load.
* Some of MySQL Connector (eg, dotnet MySQL.Data) rely on variable's column type to make connection.
* Add rollup table name in profile to help find the mv selection problem.
* Add test connection function to DB2 database to allow user check the connection when create DB2 Catalog.
* Add DNS Cache for FQDN to accelerate the connect process among BEs in K8s env.
* Refresh external table's rowcount async to make the query plan more stable.

### Enterprise Core 2.1.1

April 8, 2024

* Change float type output format to improve float type serialization performance.
* Fix issues during rolling upgrade from 2.0.x to 2.1.x, including backend node core problems and JDBC Catalog query errors.
* Enable proxy protocol to support IP transparency. Using this protocol, IP transparency for load balancing can be achieved, so that after load balancing, Doris can still obtain the client's real IP and implement permission control such as whitelisting.
* Add new system table backend_active_tasks to monitor the realtime query statics on every BE.
* Add inverted index support for CCR.
* Support arrow serialization for varint type.
* Fixed 20 bugs, including occasional core issues in the BE during the restore process.

### Enterprise Core 2.1.0

March 18, 2024

* Further improvement in the performance of complex SQL queries has been achieved, with over 100% performance enhancement on the TPC-DS 1TB test dataset, positioning query performance at the forefront of the industry.
* Performance improvements in data lake analytics scenarios, with 4-6 times better performance compared to Trino and Spark, have been made. Additionally, compatibility with multiple SQL dialects has been introduced, enabling seamless migration from existing systems to Apache Doris.
* For data science and other forms of large-scale data reading scenarios, a high-speed reading interface based on Arrow Flight has been introduced, resulting in a 100-fold improvement in data transfer efficiency.
* In semi-structured data analysis scenarios, new Variant and IP data types have been introduced, along with enhancements to a series of analytical functions, making storage and analysis of complex semi-structured data more convenient.
* The introduction of asynchronous materialized views based on multiple tables has improved query performance. This includes support for transparent rewriting acceleration, automatic refreshing, external-to-internal table materialized views, and direct querying of materialized views. Leveraging these capabilities, materialized views can also be used for data warehouse tiered modeling, job scheduling, and data processing.
* In terms of data storage, capabilities such as auto-increment columns, automatic partitioning, MemTable forwarding, and server-side batching have been introduced to improve the efficiency of real-time data writing at scale.
* Further improvements have been made in workload management, enhancing the isolation capability of Workload Group resource groups and adding the ability to view SQL resource usage at runtime, thereby enhancing stability in multi-load scenarios.

## Enterprise Core 2.0.x

### Enterprise Core 2.0.14

August 8, 2024

* Adds a REST interface to retrieve the most recent query profile: `curl http://user:password@127.0.0.1:8030/api/profile/text` .
* Optimizes the primary key point query performance for MOW tables with sequence columns.
* Enhances the performance of inverted index queries with many conditions.
* Automatically enables the support_phrase option when creating a tokenized inverted index to accelerate match_phrase phrase queries.
* Supports simplified SQL hints, for example: SELECT /*+ query_timeout(3000) */ * FROM t.
* Automatically retries reading from object storage when encountering a 429 error to improve stability.
* LEFT SEMI / ANTI JOIN terminates subsequent matching execution upon matching a qualifying data row to enhance performance.
* Prevents coredump when returning illegal data to MySQL results.
* Unifies the output of type names in lowercase to maintain compatibility with MySQL and be more friendly to BI tools.

### Enterprise Core 2.0.13

July 23, 2024

* SQL input is treated as multiple statements only when the `CLIENT_MULTI_STATEMENTS` setting is enabled on the client side, enhancing compatibility with MySQL.
* A new BE configuration allow_zero_date has been added, allowing dates with all zeros. When set to false, 0000-00-00 is parsed as NULL, and when set to true, it is parsed as 0000-01-01. The default value is false to maintain consistency with previous behavior.
* LogicalWindow and LogicalPartitionTopN support multi-field predicate pushdown to improve performance.
* The ES Catalog now maps ES nested or object types to Doris JSON types.
* Queries with LIMIT end reading data earlier to reduce resource consumption and improve performance.
* Special JSON data with empty keys is now supported.
* Stability and usability of routine load have been improved, including load balancing, automatic recovery, exception handling, and more user-friendly error messages.
* BE load balancing selection of hard disk strategy and speed optimization.
* Stability and usability of the JDBC catalog have been improved, including encryption, thread pool connection count configuration, and more user-friendly error messages. 

### Enterprise Core 2.0.12

July 1, 2024

* No longer set the default table comment to the table type. Instead, set it to be empty by default, for example, change `COMMENT 'OLAP'` to `COMMENT ''`. This new behavior is more friendly for BI software that relies on table comments.
* Change the type of the `@@autocommit` variable from `BOOLEAN` to `BIGINT` to prevent errors from certain MySQL clients (such as .NET MySQL.Data).
* Remove the `disable_nested_complex_type` parameter and allow the creation of nested `ARRAY`, `MAP`, and `STRUCT` types by default.
* The HMS catalog supports the SHOW CREATE DATABASE command.
* Add more inverted index metrics to the query profile.
* Cross-Cluster Replication (CCR) supports inverted indices.

### Enterprise Core 2.0.11

June 20, 2024

* Add trino jdbc catalog type mapping for JSON and TIME.
* FE exit when failed to transfer to (non)master to prevent unknown state and too many logs.
* Write audit log while doing drop stats table.
* Ignore min/max column stats if table is partially analyzed to avoid inefficient query plan.
* Support minus operation for set like `set1 - set2`.
* Improve perfmance of LIKE and REGEXP clause with concat(col, pattern_str), eg. `col1 LIKE concat('%', col2, '%')`.
* Add query options for short circuit queries for upgrade compatibility.
* Since the inverted index is now mature and stable, it can replace the old BITMAP INDEX. Therefore, any newly created `BITMAP INDEX` will automatically switch to an `INVERTED INDEX`, while existing `BITMAP INDEX` will remain unchanged. Users can disable this automatic switch by setting the FE configuration `enable_create_bitmap_index_as_inverted_index` to false.

### Enterprise Core 2.0.10

May 20, 2024

* This enhancement introduces the `read_only` and `super_read_only` variables to the database system, ensuring compatibility with MySQL's read-only modes.
* When the check status is not IO_ERROR, the disk path should not be added to the broken list. This ensures that only disks with actual I/O errors are marked as broken.
* When performing a Create Table As Select (CTAS) operation from an external table, convert the `varchar` column to `string` type.
* Support mapping Paimon column type "Row" to Doris type "Struct"
* Choose disk tolerate with little skew when creating tablet
* Write editlog for `set replica drop` to avoid confusing status on follower FE

### Enterprise Core 2.0.9

April 24, 2024

* Allow predicate appearing on both key and value mv columns
* Enable mv with bitmap_union(bitmap_from_array())
* Introduce a configuration to forcibly replicate allocation for all olap tables within the cluster
* Add timezone support for date literals in the new optimizer Nereids
* Enable the use of "slop" in full-text search's match_phrase to specify word distances
* Display index ID in SHOW PROC INDEXES
* Incorporate a secondary argument in first_value/last_value to overlook NULL values
* Allow the use of 0 as the offset parameter in the lead/lag function

### Enterprise Core 2.0.8

April 12, 2024

* Make Inverted Index work with TopN opt in Nereids
* Limit the max string length to 1024 while collecting column stats to control BE memory usage
* JDBC Catalog close when JDBC client is not empty
* Accept all Iceberg database and do not check the name format of database
* Refresh external table's rowcount async to avoid cache miss and unstable query plan
* Simplify the isSplitable method of hive external table to avoid too many hadoop metrics

### Enterprise Core 2.0.7

March 26, 2024

* Support make miss slot as null alias when converting outer join to anti join to speed up query.
* Add DEFAULT_ENCRYPTION column in information_schema table and add processlist table for better compatibility for BI tools.
* Automatically test connectivity by default when creating a JDBC Catalog.
* Enhance auto resume to keep routine load stable.
* Use lowercase by default for Chinese tokenizer in inverted index.
* Add error msg if exceeded maximum default value in repeat function.
* Skip hidden file and dir in hive table.
* Reduce file meta cache size and disable cache for some cases to avoid OOM.
* Reduce jvm heap memory consumed by profiles of BrokerLoadJob.
* Remove sort which is under table sink to speed up query like INSERT INTO t1 SELECT * FROM t2 ORDER BY k.

### Enterprise Core 2.0.6

March 14, 2024

* Support match a function with alias in materialized-view.
* Add a command to drop a tablet replica safely on backend.
* Add row count cache for external table.
* Support analyze rollup to gather statistics for optimizer.
* Improve tablet schema cache memory by using deterministic way to serialize protobuf.
* Improve show column stats performance.
* Support estimate row count for iceberg and paimon.
* Support sqlserver timestamp type read for JDBC catalog.

### Enterprise Core 2.0.3

December 8, 2023

* Supports automatic statistics collection, which aids the optimizer in understanding data distribution characteristics. This enables the selection of more optimal plans, significantly improving query efficiency. Starting from version 2.0.3, this feature is officially supported and is enabled by default throughout the day.
* Data Lake supports JAVA UDF, JDBC, Hudi MOR, and more system support for complex data types.
* Cross-Cluster Replication (CCR) now supports features like throttling and table truncation enhancements.
* Additional built-in functions such as SHA, JSON have been added.
* Over 20 performance improvements including inverted index, case when, predicate pushdown, etc.
* Enhanced distributed replica management, including skipping deleted partitions, colocate group, continuous write balancing failure, and inability to balance cold-hot tiered tables.
* Stability improvements in complex data types, inverted index, materialized views, import and compaction, Data Lake compatibility, SQL planning, and more.

### Enterprise Core 2.0.2

October 8, 2023

* Improved usability, including optimized priority network matching logic and support for role-based authorization at the row level.
* Enhanced statistics data collection in the new optimizer, Nereids, including the elimination of file caching during the execution of analysis tasks and support for basic JDBC external table statistics collection.
* Performance optimization and enhancement in inverted index queries, including the addition of BKD indices for improved efficiency and optimization of multi-word conjunction queries.
* Improved support for multiple types of data sources in the multi-catalog feature for data lakes, including JDBC, HDFS, Hive, MySQL, MaxCompute, and more.
* Optimization of array functions, with the array_union now supporting multiple parameters.

### Enterprise Core 2.0.1

September 16, 2023

* Improved the functionality and stability of complex data types such as arrays and maps, including nested complex types in inner tables and nesting outer tables with ORC/Parquet formats.
* Enhanced performance in inverted index queries, covering tokenization, numerical processing, predicate pushdown, and more.
* Improved query performance, including enhancements in bitmap operations, LIKE queries, scans, and aggregate functions.
* Refined and stabilized Cross-Cluster Replication (CCR) functionality.
* Accelerated and improved accuracy in the collection of statistics by the query optimizer, resulting in enhanced automatic query optimization.
* Enhanced functionality and performance in the multi-catalog feature for data lakes, including performance optimizations for Iceberg and support for complex data types.

## Enterprise Core 1.2.x

## Enterprise Core 1.2.8

September 05, 2023

* Fixed several decimal-related issues.
* Resolved the problem where "show tables" couldn't display tables for which the user had select permissions.
* Addressed issues related to replica scheduling.
* Fixed several query planning problems.
* Addressed an issue of file handle leakage in BE processes under certain circumstances.
* Fixed a problem with table creation timing out in certain scenarios.
* Resolved errors when reading ORC format files.
* Fixed an issue where closing the FileSystem in Broker caused read errors.
* Optimized the logic for calculating replica sizes in Auto Bucket.
* Fixed a NullPointerException issue in Spark Load under certain circumstances.
