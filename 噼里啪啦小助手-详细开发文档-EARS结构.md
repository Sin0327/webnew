# 噼里啪啦小助手 - 详细开发文档 (EARS结构)

## 项目概述

**项目名称**: 噼里啪啦小助手  
**项目类型**: 基于Web的智能工作流处理器  
**技术架构**: 纯静态网页应用  
**核心功能**: 通过Coze工作流API处理文本和文件，提供智能化的数据分析和处理服务

## 技术栈与环境要求

### 核心技术栈
- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **API集成**: Coze工作流API (非流式响应)
- **外部依赖**: JSZip库 (用于批量下载功能)
- **部署方式**: 静态文件托管 (支持GitHub Pages、Netlify、Vercel等)

### 环境要求
- **浏览器兼容性**: 支持现代浏览器 (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- **移动端支持**: 响应式设计，移动端优先
- **网络要求**: 需要访问Coze API (api.coze.cn)

## API配置规格 (严格保持不变)

### 核心API配置
```javascript
const COZE_API_CONFIG = {
    baseUrl: 'https://api.coze.cn/v1/workflow/run',
    fileUploadUrl: 'https://api.coze.cn/v1/files/upload',
    token: 'pat_ZiVGbB5siln3M8TWCLEvAuq63ugpMc6meCoWe9jTnivP7fzu1g6fPVv5uVPZ1AMi',
    workflowIds: {
        a: '7560945341966483502',  // 报价工作流
        b: '7553278219114971136',  // 物料查询工作流
        c: '7562027540538408996'   // 报价Excel匹配工作流
    }
};
```

### 工作流API规格

#### 工作流A - 报价工作流
- **工作流ID**: `7560945341966483502`
- **功能**: 文本内容的智能报价分析和处理
- **请求格式**:
```json
{
    "workflow_id": "7560945341966483502",
    "parameters": {
        "input": "用户输入的文本内容"
    }
}
```

#### 工作流B - 物料查询工作流
- **工作流ID**: `7553278219114971136`
- **功能**: 物料信息查询和分析
- **请求格式**:
```json
{
    "workflow_id": "7553278219114971136",
    "parameters": {
        "input": "用户输入的查询内容"
    }
}
```

#### 工作流C - Excel文件处理工作流
- **工作流ID**: `7562027540538408996`
- **功能**: Excel文件的智能匹配和数据分析
- **请求格式**:
```json
{
    "workflow_id": "7562027540538408996",
    "parameters": {
        "input": "{\"file_id\":\"${file_id}\"}"
    }
}
```

#### 文件上传API
- **接口地址**: `https://api.coze.cn/v1/files/upload`
- **请求方法**: POST (multipart/form-data)
- **认证方式**: Bearer Token
- **支持格式**: .xlsx, .xls

## 开发需求规格 (EARS语法)

### 1. 应用初始化需求

#### R1.1 应用启动需求
**WHEN** 页面加载完成 **THEN** 系统应执行以下初始化操作：
- 调用 `initializeApp()` 函数
- 验证API配置有效性
- 设置文件上传功能
- 初始化滚动特性
- 显示主菜单界面

#### R1.2 API配置验证需求
**WHEN** 应用初始化时 **THEN** 系统应调用 `validateAPIConfiguration()` 函数验证：
- API Token的有效性
- 工作流ID的完整性
- 网络连接状态
- 配置参数格式正确性

### 2. 主界面导航需求

#### R2.1 主菜单显示需求
**WHEN** 用户访问应用首页 **THEN** 系统应显示卡片式主菜单，包含：
- 报价工作流入口卡片 ("想知道报价吗，点我点我点我！")
- Excel文件处理工作流入口卡片 ("报价Excel匹配")
- 预留扩展功能卡片 (显示"敬请期待"状态)

#### R2.2 工作流页面导航需求
**WHEN** 用户点击菜单卡片 **THEN** 系统应：
- 调用 `openWorkflowPage(type)` 函数
- 隐藏主菜单界面
- 显示对应的工作流页面
- 显示返回主页按钮

#### R2.3 返回主页需求
**WHEN** 用户点击返回主页按钮 **THEN** 系统应：
- 调用 `showMainMenu()` 函数
- 隐藏当前工作流页面
- 显示主菜单界面
- 隐藏导航按钮

### 3. 报价工作流处理需求

#### R3.1 文本输入需求
**WHEN** 用户在报价工作流页面 **THEN** 系统应提供：
- 大型多行文本输入框
- 输入内容实时验证
- 字符计数显示
- 清空输入按钮

#### R3.2 测试数据功能需求
**WHEN** 用户点击"添加测试数据"按钮 **THEN** 系统应：
- 调用 `addTestData('a')` 函数
- 在输入框中填入预设的测试内容
- 自动聚焦到输入框

#### R3.3 报价处理需求
**WHEN** 用户输入文本内容并点击处理按钮 **IF** 输入内容不为空 **THEN** 系统应：
- 调用 `processWorkflow('a')` 函数
- 显示加载状态
- 调用 `callCozeWorkflowAPI('a', inputText)` 处理请求
- 使用 `formatCozeResponse(data)` 格式化响应
- 调用 `displayResult('pricing-result', content, fullData)` 显示结果

#### R3.4 结果展示需求
**WHEN** API返回处理结果 **THEN** 系统应：
- 在结果区域显示格式化内容
- 提供复制、下载、详细查看按钮
- 支持长文本滚动显示
- 保存完整数据用于详细查看

### 4. Excel文件处理需求

#### R4.1 文件上传界面需求
**WHEN** 用户进入Excel工作流页面 **THEN** 系统应显示：
- 文件拖拽上传区域
- 文件选择按钮
- 支持的文件格式说明 (.xlsx, .xls)
- 文件信息显示区域

#### R4.2 拖拽上传需求
**WHEN** 用户拖拽文件到上传区域 **THEN** 系统应：
- 调用 `setupExcelDragAndDrop()` 处理拖拽事件
- 验证文件格式
- 显示拖拽视觉反馈
- 自动选择有效的Excel文件

#### R4.3 文件信息显示需求
**WHEN** 用户选择文件后 **THEN** 系统应：
- 调用 `displayExcelFileInfo(file)` 显示文件信息
- 显示文件名、大小、类型
- 提供文件清除功能
- 启用处理按钮

#### R4.4 Excel文件处理需求
**WHEN** 用户点击处理Excel文件按钮 **IF** 已选择有效文件 **THEN** 系统应：
1. 调用 `uploadFileToCoze(file)` 上传文件获取file_id
2. 将file_id以JSON格式传递给工作流C
3. 调用 `processFileWithWorkflowC(fileId)` 处理文件
4. 使用 `formatExcelMaterialTable(materials)` 格式化表格数据
5. 调用 `displayResult('excel-result', content, fullData)` 显示结果

### 5. 数据操作功能需求

#### R5.1 复制功能需求
**WHEN** 用户点击复制按钮 **THEN** 系统应：
- 调用对应的 `copyResult(type)` 函数
- 将结果内容复制到剪贴板
- 显示复制成功通知

#### R5.2 下载功能需求
**WHEN** 用户点击下载按钮 **THEN** 系统应：
- 调用对应的 `downloadResult(type)` 函数
- 生成包含时间戳的文件名
- 下载TXT格式的结果文件

#### R5.3 Excel下载功能需求
**WHEN** 用户点击Excel下载按钮 **IF** 结果包含表格数据 **THEN** 系统应：
- 调用 `downloadExcelFile(data, fileName)` 函数
- 应用预设的列顺序和中文列名映射
- 设置专业的字体样式和列宽
- 下载格式化的Excel文件

#### R5.4 批量下载需求
**WHEN** 用户点击批量下载按钮 **THEN** 系统应：
- 调用 `downloadAllResults()` 函数
- 使用JSZip打包所有结果文件
- 下载包含所有结果的ZIP文件

### 6. 详细查看功能需求

#### R6.1 全屏模态框需求
**WHEN** 用户点击详细查看按钮 **THEN** 系统应：
- 调用 `viewDetailedResult(type)` 函数
- 显示全屏模态框
- 展示完整的处理结果
- 提供独立的滚动功能

#### R6.2 模态框交互需求
**WHEN** 模态框显示时 **THEN** 系统应支持：
- ESC键关闭模态框
- 点击遮罩关闭模态框
- 点击关闭按钮关闭模态框
- 模态框内容区域独立滚动

#### R6.3 模态框操作需求
**WHEN** 模态框显示时 **THEN** 系统应提供：
- 复制完整结果功能 (`copyModalResult()`)
- 下载完整结果功能 (`downloadModalResult()`)
- 优化的阅读体验 (字体大小、行高、内边距)

### 7. API连接测试需求

#### R7.1 连接测试需求
**WHEN** 用户点击测试连接按钮 **THEN** 系统应：
- 调用 `testAPIConnection()` 函数
- 发送测试请求到Coze API
- 显示连接状态和响应时间
- 提供详细的错误信息 (如果连接失败)

#### R7.2 完整API测试需求
**WHEN** 用户点击完整测试按钮 **THEN** 系统应：
- 调用 `testAPI()` 函数
- 测试所有工作流的连通性
- 显示详细的API配置信息
- 提供测试结果报告

### 8. 错误处理需求

#### R8.1 全局错误捕获需求
**WHEN** 应用运行时发生错误 **THEN** 系统应：
- 监听window error和unhandledrejection事件
- 将技术错误转换为用户友好的提示
- 记录错误日志用于调试
- 显示适当的错误通知

#### R8.2 API错误处理需求
**WHEN** API调用失败 **THEN** 系统应：
- 检查HTTP状态码和业务状态码
- 提供具体的错误原因说明
- 建议用户可能的解决方案
- 保持界面稳定性

#### R8.3 文件上传错误处理需求
**WHEN** 文件上传失败 **THEN** 系统应：
- 验证文件格式和大小
- 提供清晰的错误提示
- 允许用户重新选择文件
- 重置上传状态

### 9. 用户体验优化需求

#### R9.1 加载状态需求
**WHEN** 系统处理请求时 **THEN** 系统应：
- 调用 `showLoading(true)` 显示加载动画
- 禁用相关操作按钮
- 显示处理进度提示
- 处理完成后调用 `showLoading(false)`

#### R9.2 通知系统需求
**WHEN** 需要向用户反馈操作结果时 **THEN** 系统应：
- 调用 `showNotification(message, type)` 显示Toast通知
- 支持成功、警告、错误等不同类型
- 自动消失或手动关闭
- 不阻塞用户其他操作

#### R9.3 响应式设计需求
**WHEN** 用户在不同设备上访问应用 **THEN** 系统应：
- 自适应屏幕尺寸
- 优化移动端交互体验
- 保持功能完整性
- 提供一致的视觉效果

## 核心函数实现规格

### 应用初始化函数

#### `initializeApp()`
**功能**: 应用初始化入口函数
**调用时机**: DOM加载完成后
**主要职责**:
- 验证API配置
- 设置文件上传功能
- 初始化滚动特性
- 绑定事件监听器

#### `validateAPIConfiguration()`
**功能**: 验证API配置有效性
**返回值**: 配置问题数组
**验证项目**:
- Token格式和有效性
- 工作流ID完整性
- API端点可访问性

### API调用函数

#### `callCozeWorkflowAPI(type, inputText)`
**功能**: 调用Coze工作流API的核心函数
**参数**:
- `type`: 工作流类型 ('a', 'b', 'c')
- `inputText`: 输入文本内容
**返回值**: Promise<API响应数据>
**错误处理**: HTTP状态码和业务状态码检查

#### `uploadFileToCoze(file)`
**功能**: 上传文件到Coze API
**参数**: `file` - File对象
**返回值**: Promise<{fileId: string}>
**支持格式**: .xlsx, .xls

#### `processFileWithWorkflowC(fileId)`
**功能**: 使用工作流C处理文件
**参数**: `fileId` - 文件ID
**返回值**: Promise<处理结果>

### 数据格式化函数

#### `formatCozeResponse(data)`
**功能**: 格式化API响应数据
**参数**: `data` - API原始响应
**返回值**: 格式化后的HTML内容
**特殊处理**:
- 药房分析数据格式化
- 图片URL识别和展示
- 长文本分段处理

#### `formatExcelMaterialTable(materials)`
**功能**: 格式化Excel工作流返回的表格数据
**参数**: `materials` - 材料数据数组
**返回值**: HTML表格字符串
**特性**:
- 中文列名映射
- 列顺序控制
- 数据类型格式化

### 界面操作函数

#### `openWorkflowPage(type)`
**功能**: 打开指定的工作流页面
**参数**: `type` - 页面类型 ('pricing', 'excel')
**操作**:
- 隐藏主菜单
- 显示对应工作流页面
- 显示导航按钮

#### `showMainMenu()`
**功能**: 显示主菜单
**操作**:
- 隐藏所有工作流页面
- 显示主菜单
- 隐藏导航按钮

#### `displayResult(resultId, content, fullData)`
**功能**: 在指定区域显示处理结果
**参数**:
- `resultId`: 结果区域ID
- `content`: 显示内容
- `fullData`: 完整数据 (用于详细查看)

### 文件操作函数

#### `setupExcelDragAndDrop()`
**功能**: 设置Excel文件拖拽上传功能
**绑定事件**:
- dragover, dragenter, dragleave, drop
- 文件格式验证
- 视觉反馈

#### `displayExcelFileInfo(file)`
**功能**: 显示选择的文件信息
**参数**: `file` - File对象
**显示内容**: 文件名、大小、类型

#### `clearExcelFile()`
**功能**: 清除已选择的文件
**操作**:
- 重置文件输入
- 清除文件信息显示
- 禁用处理按钮

### 数据操作函数

#### `copyResult(type)`
**功能**: 复制指定类型的结果
**参数**: `type` - 结果类型
**操作**: 复制到剪贴板并显示通知

#### `downloadResult(type)`
**功能**: 下载指定类型的结果
**参数**: `type` - 结果类型
**文件格式**: TXT (包含时间戳)

#### `downloadExcelFile(data, fileName)`
**功能**: 下载Excel格式的数据文件
**参数**:
- `data`: 表格数据数组
- `fileName`: 文件名
**特性**:
- 列顺序一致性
- 中文列名映射
- 专业字体样式
- 智能列宽设置

#### `downloadAllResults()`
**功能**: 批量下载所有结果
**依赖**: JSZip库
**输出**: ZIP压缩包

### 模态框函数

#### `viewDetailedResult(type)`
**功能**: 在全屏模态框中显示详细结果
**参数**: `type` - 结果类型
**特性**:
- 全屏显示
- 独立滚动
- 优化阅读体验

#### `copyModalResult()`
**功能**: 复制模态框中的完整结果

#### `downloadModalResult()`
**功能**: 下载模态框中的完整结果

### 测试和调试函数

#### `testAPIConnection()`
**功能**: 测试API连接状态
**返回值**: Promise<连接结果>
**测试项目**: 网络连通性、认证有效性

#### `testAPI()`
**功能**: 完整的API功能测试
**测试范围**: 所有工作流的连通性和响应

#### `addTestData(type)`
**功能**: 添加测试数据到输入框
**参数**: `type` - 工作流类型
**测试数据**: 预设的结构化测试内容

### 工具函数

#### `showLoading(show)`
**功能**: 显示或隐藏加载状态
**参数**: `show` - 布尔值

#### `showNotification(message, type)`
**功能**: 显示Toast通知
**参数**:
- `message`: 通知内容
- `type`: 通知类型 ('success', 'warning', 'error')

#### `debounce(func, wait)`
**功能**: 防抖函数
**用途**: 防止频繁操作

#### `throttle(func, limit)`
**功能**: 节流函数
**用途**: 控制操作频率

## Excel下载优化实现

### 列顺序映射配置
```javascript
const fieldToDisplayMapping = {
    'uid': 'UID',
    'medicine_name': '药品名称',
    'specification': '规格',
    'manufacturer': '生产厂家',
    'price': '价格',
    'quantity': '数量',
    'total_price': '总价',
    'supplier': '供应商',
    'contact': '联系方式',
    'notes': '备注'
};
```

### 列宽预设配置
```javascript
const columnWidthPresets = {
    'uid': 8,
    'medicine_name': 20,
    'specification': 15,
    'manufacturer': 18,
    'price': 12,
    'quantity': 8,
    'total_price': 12,
    'supplier': 15,
    'contact': 18,
    'notes': 25
};
```

### 样式配置
```javascript
const defaultFont = {
    name: '微软雅黑',
    size: 11
};

const headerStyle = {
    font: { ...defaultFont, bold: true },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { fgColor: { rgb: 'F2F2F2' } },
    border: { /* 边框配置 */ }
};
```

## 项目文件结构

```
噼里啪啦小助手/
├── index.html              # 主页面文件
├── styles.css              # 样式表文件
├── script.js               # 主要JavaScript逻辑
├── debug.html              # 调试页面 (可选)
├── start_server.bat        # Windows服务器启动脚本
├── start_server.ps1        # PowerShell服务器启动脚本
└── README.md               # 项目说明文档
```

## 部署指南

### 本地开发环境
1. **Python HTTP服务器**:
   ```bash
   python -m http.server 8000
   ```
2. **访问地址**: `http://localhost:8000`

### 生产部署
1. **GitHub Pages**: 直接上传到GitHub仓库，启用Pages功能
2. **Netlify**: 拖拽文件夹到Netlify部署界面
3. **Vercel**: 连接GitHub仓库自动部署
4. **其他静态托管**: 上传所有文件到静态文件服务器

## 开发规范

### 代码风格
- 使用ES6+语法
- 函数命名采用驼峰命名法
- 常量使用大写字母和下划线
- 添加必要的注释说明

### 错误处理
- 所有异步操作必须包含try-catch
- API调用必须检查HTTP状态码和业务状态码
- 提供用户友好的错误提示

### 性能优化
- 使用防抖和节流控制用户操作频率
- 大数据量处理采用分批处理
- 合理使用缓存机制

### 安全考虑
- 输入验证和清理
- API Token安全处理
- 防止XSS攻击

## 测试指南

### 功能测试
1. **API连接测试**: 验证所有工作流的连通性
2. **文件上传测试**: 测试各种Excel文件格式
3. **数据处理测试**: 验证数据格式化和显示
4. **下载功能测试**: 测试各种下载格式

### 兼容性测试
1. **浏览器兼容性**: 测试主流浏览器
2. **移动端兼容性**: 测试不同屏幕尺寸
3. **网络环境测试**: 测试不同网络条件

### 性能测试
1. **大文件处理**: 测试大型Excel文件处理
2. **长文本处理**: 测试超长API响应
3. **并发操作**: 测试多个操作同时进行

## 故障排除

### 常见问题
1. **API连接失败**: 检查网络连接和Token有效性
2. **文件上传失败**: 验证文件格式和大小
3. **数据显示异常**: 检查API响应格式
4. **下载功能异常**: 验证浏览器下载权限

### 调试工具
1. **浏览器开发者工具**: 查看网络请求和控制台错误
2. **debug.html页面**: 专门的调试界面
3. **日志导出功能**: 导出详细的操作日志

---

**文档版本**: v1.0  
**最后更新**: 2025-01-27  
**开发状态**: 功能完整，可直接使用  
**API状态**: 已配置并测试通过  
**部署方式**: 静态文件，支持多种托管平台  
**EARS结构**: 完整的开发需求规格化描述