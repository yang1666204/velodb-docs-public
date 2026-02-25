# velodb-cloud-doc
Document for VeloDB Cloud

## 文档编写规范

- 目录和文件名必须为英文，使用小写，不能包含中文和空格。

## FAQ
### 如何设置图片的宽度和高度？
- 将markdown文件后缀由.md改为.mdx，mdx是markdown的扩展，支持markdown所有原生语法。
- ```<img src={require('./xxxx.png').default} style={{width: '32px', height: '32px'}} alt="xxxx" />```。

### svg的图片不显示？
- 将markdown文件后缀由.md改为.mdx
- 引入svg： ```import HiveIcon from './assets/logo/hive.svg'```
- 使用：```<HiveIcon width={'3rem'} height={'3rem'} /> ```

### 如何居中文字？
需要在.mdx文件中按下面的方式写：
```javascript
<div style={{textAlign: 'center'}}>云原生存算分离架构</div>
```


