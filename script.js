// 全局变量
let currentFile = null;
let isProcessing = false;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    setupFileUpload();
    setupDragAndDrop();
    addInputValidation();
    validateAPIConfiguration();
    initializeScrollFeatures();
    initializeNavigation();
}

// 验证API配置
function validateAPIConfiguration() {
    console.log('🔧 验证API配置...');
    
    const config = COZE_API_CONFIG;
    const issues = [];
    
    // 检查基础配置
    if (!config.baseUrl) {
        issues.push('缺少API基础URL');
    }
    
    if (!config.token) {
        issues.push('缺少API Token');
    } else if (config.token.length < 10) {
        issues.push('API Token格式可能不正确');
    }
    
    // 检查工作流ID
    if (!config.workflowIds.a) {
        issues.push('工作流A的ID未配置');
    }
    
    if (!config.workflowIds.b) {
        issues.push('工作流B的ID未配置');
    }
    
    if (!config.workflowIds.c) {
        issues.push('工作流C的ID未配置');
    }
    
    // 检查文件上传URL
    if (!config.fileUploadUrl) {
        issues.push('文件上传API URL未配置');
    }
    
    // 显示配置状态
    console.log('📊 API配置状态:', {
        baseUrl: config.baseUrl,
        fileUploadUrl: config.fileUploadUrl,
        tokenLength: config.token ? config.token.length : 0,
        workflowA: config.workflowIds.a || '未配置',
        workflowB: config.workflowIds.b || '未配置',
        workflowC: config.workflowIds.c || '未配置',
        issues: issues
    });
    
    // 在界面上显示配置状态
    displayAPIStatus(issues);
    
    return issues.length === 0;
}

// 显示API状态
function displayAPIStatus(issues) {
    const workflowACard = document.querySelector('.workflow-card:first-child');
    
    // 检查元素是否存在，如果不存在则跳过
    if (!workflowACard) {
        return;
    }
    
    const statusElement = workflowACard.querySelector('.api-status') || createStatusElement();
    
    if (!workflowACard.querySelector('.api-status')) {
        const cardHeader = workflowACard.querySelector('.card-header');
        if (cardHeader) {
            cardHeader.appendChild(statusElement);
        }
    }
    
    if (issues.length === 0) {
        statusElement.innerHTML = '<span style="color: #00ff88;">🟢 API已配置</span>';
        statusElement.title = 'API配置正常，可以正常调用';
    } 
}

// 创建状态显示元素
function createStatusElement() {
    const statusElement = document.createElement('div');
    statusElement.className = 'api-status';
    statusElement.style.cssText = 'font-size: 12px; margin-left: 10px;';
    return statusElement;
}

// 设置文件上传功能
function setupFileUpload() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const processBtn = document.getElementById('process-file-btn');

    // 检查元素是否存在，如果不存在则跳过初始化
    if (!uploadZone || !fileInput) {
        return;
    }

    // 点击上传区域触发文件选择
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择处理
    fileInput.addEventListener('change', handleFileSelect);
}

// 设置拖拽上传功能
function setupDragAndDrop() {
    const uploadZone = document.getElementById('upload-zone');

    // 检查元素是否存在，如果不存在则跳过初始化
    if (!uploadZone) {
        return;
    }

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

// 初始化滚动功能
function initializeScrollFeatures() {
    console.log('🔄 初始化滚动功能...');
    
    // 获取所有结果内容区域
    const resultContents = document.querySelectorAll('.result-content');
    
    resultContents.forEach((content, index) => {
        // 确保滚动属性正确设置
        content.style.overflowY = 'auto';
        content.style.overflowX = 'hidden';
        content.style.maxHeight = '400px';
        
        // 添加滚轮事件监听器以确保滚动正常工作
        content.addEventListener('wheel', function(e) {
            // 检查是否需要滚动
            const isScrollable = this.scrollHeight > this.clientHeight;
            
            if (isScrollable) {
                // 检查滚动方向和当前滚动位置
                const deltaY = e.deltaY;
                const scrollTop = this.scrollTop;
                const scrollHeight = this.scrollHeight;
                const clientHeight = this.clientHeight;
                
                // 如果向上滚动且已经在顶部，或向下滚动且已经在底部，则允许事件冒泡
                const atTop = scrollTop === 0;
                const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
                
                if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
                    // 在边界处，允许事件冒泡到父元素
                    return;
                } else {
                    // 在内容区域内，阻止事件冒泡
                    e.stopPropagation();
                }
            }
            // 如果不可滚动，允许事件正常传播
        });
        
        // 添加内容变化监听器
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    // 内容发生变化时，重新检查滚动条
                    setTimeout(() => {
                        checkScrollbarVisibility(content);
                    }, 50);
                }
            });
        });
        
        observer.observe(content, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        // 添加滚轮功能测试
        content.addEventListener('wheel', function(e) {
            console.log(`🖱️ 滚轮事件触发 - 区域 ${index + 1}, deltaY: ${e.deltaY}, scrollTop: ${this.scrollTop}`);
        }, { passive: true });
        
        console.log(`✅ 滚动功能已初始化 - 结果区域 ${index + 1}`);
    });
}

// 检查滚动条可见性
function checkScrollbarVisibility(element) {
    const contentHeight = element.scrollHeight;
    const containerHeight = element.clientHeight;
    
    console.log(`检查滚动条: 内容高度=${contentHeight}, 容器高度=${containerHeight}`);
    
    if (contentHeight > containerHeight) {
        element.style.overflowY = 'auto';
        console.log('✅ 滚动条应该可见');
    } else {
        element.style.overflowY = 'auto'; // 保持auto，让浏览器决定
        console.log('ℹ️ 内容未超出容器，滚动条隐藏');
    }
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// 处理文件
function handleFile(file) {
    // 验证文件类型
    const allowedTypes = ['.txt', '.csv', '.md', '.json', '.xml'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
        showNotification('不支持的文件格式，请上传 .txt, .csv, .md, .json 或 .xml 文件', 'error');
        return;
    }

    // 验证文件大小 (限制为10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showNotification('文件大小超过限制，请上传小于10MB的文件', 'error');
        return;
    }

    currentFile = file;
    displayFileInfo(file);
    enableProcessButton();
}

// 显示文件信息
function displayFileInfo(file) {
    const fileInfo = document.getElementById('file-info');
    const fileName = fileInfo.querySelector('.file-name');
    const fileSize = fileInfo.querySelector('.file-size');

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'flex';
}

// 启用处理按钮
function enableProcessButton() {
    const processBtn = document.getElementById('process-file-btn');
    processBtn.disabled = false;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 添加输入验证
function addInputValidation() {
    const textInputs = document.querySelectorAll('.text-input');
    
    textInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });
    });
}

// 验证输入
function validateInput(input) {
    const value = input.value.trim();
    const minLength = 5;
    
    if (value.length > 0 && value.length < minLength) {
        input.style.borderColor = 'var(--warning-color)';
    } else if (value.length >= minLength) {
        input.style.borderColor = 'var(--success-color)';
    } else {
        input.style.borderColor = 'var(--border-color)';
    }
}

// 处理工作流A或B
async function processWorkflow(type) {
    console.log('🚀 processWorkflow called with type:', type);
    
    if (isProcessing) {
        console.log('⏳ 正在处理中，忽略重复请求');
        showNotification('正在处理中，请稍候...', 'warning');
        return;
    }

    // 检查是否在独立界面中
    const isInPricingPage = document.getElementById('pricing-workflow-page').style.display !== 'none';
    const isInMaterialPage = document.getElementById('material-workflow-page').style.display !== 'none';
    
    console.log('📄 页面状态检查:', {
        isInPricingPage,
        isInMaterialPage,
        type
    });
    
    let inputId, resultId, input;
    if (isInPricingPage && (type === 'pricing' || type === 'a')) {
        // 在报价查询独立界面中处理工作流
        inputId = 'pricing-input';
        resultId = 'pricing-result';
        input = document.getElementById(inputId);
    } else if (isInMaterialPage && (type === 'material' || type === 'b')) {
        // 在物料查询独立界面中处理工作流
        inputId = 'material-input';
        resultId = 'material-result';
        input = document.getElementById(inputId);
        console.log('📦 物料查询工作流配置:', { inputId, resultId, inputExists: !!input });
    } else {
        // 在原始界面中处理
        inputId = `input-${type}`;
        resultId = `result-${type}`;
        input = document.getElementById(inputId);
    }
    
    const inputText = input.value.trim();

    if (!inputText) {
        showNotification('请输入内容后再处理', 'warning');
        input.focus();
        return;
    }

    if (inputText.length < 1) {
        showNotification('输入内容太短，请输入至少2个字符', 'warning');
        input.focus();
        return;
    }

    try {
        isProcessing = true;
        showLoading(true);
        
        // 显示开始处理的提示
        if (type === 'pricing' || type === 'a') {
            showNotification('正在调用扣子工作流API...', 'info');
        } else if (type === 'material' || type === 'b') {
            showNotification('正在调用物料查询工作流API...', 'info');
        } else {
            showNotification('正在处理工作流...', 'info');
        }
        
        // 调用工作流API
        let result, fullApiResponse;
        
        // 将新键值映射到旧的API调用参数
        let apiType = type;
        if (type === 'pricing') apiType = 'a';
        if (type === 'material') apiType = 'b';
        if (type === 'excel') apiType = 'c';
        
        if (apiType === 'a' || apiType === 'b') {
            // 调用真实的Coze API
            fullApiResponse = await callCozeWorkflowAPI(apiType, inputText);
            result = fullApiResponse.formattedResult; // 提取格式化的结果用于显示
        } else {
            // 其他工作流使用模拟API
            result = await simulateWorkflowAPI(apiType, inputText);
            fullApiResponse = { simulatedResult: result, timestamp: new Date().toISOString() };
        }
        
        displayResult(resultId, result, fullApiResponse);
        
        if (type === 'pricing' || type === 'a') {
            showNotification('扣子工作流处理完成！', 'success');
        } else if (type === 'material' || type === 'b') {
            showNotification('物料查询工作流处理完成！', 'success');
        } else {
            showNotification(`工作流处理完成`, 'success');
        }
        
    } catch (error) {
        console.error('工作流处理错误:', error);
        
        // 根据错误类型提供不同的用户反馈
        let errorMessage = '处理失败，请稍后重试';
        
        if (error.message.includes('HTTP错误')) {
            errorMessage = '网络连接失败，请检查网络后重试';
        } else if (error.message.includes('API错误')) {
            errorMessage = `API调用失败：${error.message}`;
        } else if (error.message.includes('暂未配置')) {
            errorMessage = error.message;
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = '无法连接到API服务，请检查网络连接';
        }
        
        showNotification(errorMessage, 'error');
        
        // 在结果区域显示错误信息
        displayResult(resultId, `处理失败\n\n错误信息：${error.message}\n\n请检查：\n1. 网络连接是否正常\n2. API配置是否正确\n3. 输入内容是否符合要求\n\n如果问题持续存在，请联系技术支持。`);
        
    } finally {
        isProcessing = false;
        showLoading(false);
    }
}

// 处理文件工作流
async function processFileWorkflow() {
    if (!currentFile) {
        showNotification('请先选择文件', 'warning');
        return;
    }

    if (isProcessing) {
        showNotification('正在处理中，请稍候...', 'warning');
        return;
    }

    try {
        isProcessing = true;
        showLoading(true);
        
        // 读取文件内容
        const fileContent = await readFileContent(currentFile);
        
        // 模拟文件处理API调用
        const result = await simulateFileProcessingAPI(currentFile.name, fileContent);
        
        displayResult('result-file', result);
        showNotification('文件处理完成', 'success');
        
    } catch (error) {
        console.error('文件处理错误:', error);
        showNotification('文件处理失败，请稍后重试', 'error');
    } finally {
        isProcessing = false;
        showLoading(false);
    }
}

// 读取文件内容
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

// 扣子工作流API配置
const COZE_API_CONFIG = {
    baseUrl: 'https://api.coze.cn/v1/workflow/run',
    fileUploadUrl: 'https://api.coze.cn/v1/files/upload',
    token: 'pat_ZiVGbB5siln3M8TWCLEvAuq63ugpMc6meCoWe9jTnivP7fzu1g6fPVv5uVPZ1AMi',
    workflowIds: {
        a: '7560945341966483502',
        b: '7553278219114971136', // 简单物料查询工作流
        c: '7562027540538408996'  // 报价Excel匹配工作流
    }
};

// 调用扣子工作流API
async function callCozeWorkflowAPI(type, inputText) {
    const workflowId = COZE_API_CONFIG.workflowIds[type];
    
    if (!workflowId) {
        throw new Error(`工作流${type.toUpperCase()}暂未配置API`);
    }

    const requestBody = {
        workflow_id: workflowId,
        parameters: {
            input: inputText
        }
    };

    console.log('🚀 开始调用扣子API');
    console.log('📋 请求配置:', {
        url: COZE_API_CONFIG.baseUrl,
        workflowId: workflowId,
        inputLength: inputText.length
    });
    console.log('📦 请求体:', JSON.stringify(requestBody, null, 2));

    try {
        console.log('🌐 发送网络请求...');
        const response = await fetch(COZE_API_CONFIG.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${COZE_API_CONFIG.token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📡 收到响应:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        // 检查HTTP状态码
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ HTTP错误响应:', errorText);
            
            // 尝试解析错误响应为JSON
            try {
                const errorJson = JSON.parse(errorText);
                console.error('📄 错误详情:', errorJson);
                if (errorJson.msg) {
                    throw new Error(`API错误 ${response.status}: ${errorJson.msg}`);
                }
            } catch (parseError) {
                console.error('无法解析错误响应为JSON');
            }
            
            throw new Error(`HTTP错误 ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('📄 API响应数据:', JSON.stringify(result, null, 2));
        
        // 检查业务状态码
        if (result.code !== 0) {
            console.error('❌ API业务错误:', result);
            throw new Error(`API错误 ${result.code}: ${result.msg || '未知错误'}`);
        }

        console.log('✅ API调用成功');
        
        // 解析data字段中的JSON字符串
        let parsedData;
        try {
            if (typeof result.data === 'string') {
                parsedData = JSON.parse(result.data);
                console.log('📄 解析后的数据:', parsedData);
            } else {
                parsedData = result.data;
            }
        } catch (parseError) {
            console.error('❌ 解析data字段失败:', parseError);
            console.log('原始data内容:', result.data);
            throw new Error('API返回的数据格式无法解析');
        }
        
        const formattedResult = formatCozeResponse(parsedData);
        console.log('📝 格式化结果:', formattedResult);
        
        // 返回包含完整数据的对象
        return {
            formattedResult: formattedResult,
            fullResponse: result,
            parsedData: parsedData,
            timestamp: new Date().toISOString(),
            requestInfo: {
                workflowId: workflowId,
                inputText: inputText
            }
        };
        
    } catch (error) {
        console.error('💥 扣子API调用失败:', error);
        console.error('🔍 错误详情:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // 提供更详细的错误分析
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('🌐 网络连接问题：可能是CORS、网络不通或URL错误');
        } else if (error.message.includes('401')) {
            console.error('🔑 认证失败：请检查API Token是否正确');
        } else if (error.message.includes('404')) {
            console.error('🔍 接口不存在：请检查API URL和工作流ID');
        }
        
        throw error;
    }
}

// 上传文件到Coze API获取URL
async function uploadFileToCoze(file) {
    console.log('📁 开始上传文件到Coze API');
    console.log('📋 文件信息:', {
        name: file.name,
        size: file.size,
        type: file.type
    });

    try {
        // 创建FormData对象
        const formData = new FormData();
        formData.append('file', file);

        console.log('🌐 发送文件上传请求...');
        const response = await fetch(COZE_API_CONFIG.fileUploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COZE_API_CONFIG.token}`
                // 注意：不要设置Content-Type，让浏览器自动设置multipart/form-data
            },
            body: formData
        });

        console.log('📡 收到上传响应:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });

        // 检查HTTP状态码
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 文件上传HTTP错误:', errorText);
            
            try {
                const errorJson = JSON.parse(errorText);
                console.error('📄 上传错误详情:', errorJson);
                if (errorJson.msg) {
                    throw new Error(`文件上传错误 ${response.status}: ${errorJson.msg}`);
                }
            } catch (parseError) {
                console.error('无法解析上传错误响应为JSON');
            }
            
            throw new Error(`文件上传HTTP错误 ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('📄 文件上传响应数据:', JSON.stringify(result, null, 2));
        
        // 检查业务状态码
        if (result.code !== 0) {
            console.error('❌ 文件上传业务错误:', result);
            throw new Error(`文件上传错误 ${result.code}: ${result.msg || '未知错误'}`);
        }

        console.log('✅ 文件上传成功');
        
        // 根据Coze API文档，文件上传只返回file_id
        // 工作流会自动将file_id转换为可访问的URL
        const fileId = result.data.id;
        console.log('📁 获取到文件ID:', fileId);
        
        console.log('📋 文件上传结果分析:', {
            fileId: fileId,
            availableFields: Object.keys(result.data),
            allData: result.data
        });
        
        return {
            fileId: fileId,
            fileName: file.name,
            fileSize: file.size,
            uploadTime: new Date().toISOString(),
            fullResponse: result
        };
        
    } catch (error) {
        console.error('💥 文件上传失败:', error);
        console.error('🔍 错误详情:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // 提供更详细的错误分析
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('🌐 网络连接问题：可能是CORS、网络不通或URL错误');
        } else if (error.message.includes('401')) {
            console.error('🔑 认证失败：请检查API Token是否正确');
        } else if (error.message.includes('413')) {
            console.error('📦 文件过大：请检查文件大小限制');
        }
        
        throw error;
    }
}

// 将文件ID转换为Coze工作流可识别的文件URL
// 处理文件上传并调用第三个工作流
async function processFileWithWorkflowC(file) {
    console.log('🔄 开始处理文件上传到工作流C的完整流程');
    
    try {
        // 第一步：上传文件获取ID
        console.log('📤 步骤1: 上传文件到Coze...');
        const uploadResult = await uploadFileToCoze(file);
        console.log('✅ 文件上传完成，获得ID:', uploadResult.fileId);
        
        // 步骤2: 准备文件ID参数
        console.log('🔗 步骤2: 准备文件ID参数...');
        
        const fileId = uploadResult.fileId;
        console.log('📁 使用文件ID:', fileId);
        
        // 根据Coze API文档，需要以JSON格式传递file_id
        // 格式: "parameters": { "input": "{\"file_id\": \"xxxxx\"}" }
        const fileIdJson = JSON.stringify({ file_id: fileId });
        console.log('📋 文件ID JSON格式:', fileIdJson);
        
        // 步骤3: 调用第三个工作流
        console.log('🚀 步骤3: 调用第三个工作流...');
        const workflowResult = await callCozeWorkflowAPI('c', fileIdJson);
        console.log('✅ 工作流调用完成');
        
        // 返回完整结果
        return {
            uploadResult: uploadResult,
            workflowResult: workflowResult,
            processTime: new Date().toISOString(),
            fileName: file.name
        };
        
    } catch (error) {
        console.error('💥 文件处理流程失败:', error);
        throw error;
    }
}



// 格式化扣子API响应
function formatCozeResponse(data) {
    if (!data) {
        return '未返回结果数据';
    }

    let formattedResult = '';
    
    // 优先处理down_url格式（Excel工作流的药品匹配数据）
    if (data.down_url && Array.isArray(data.down_url)) {
        console.log('formatCozeResponse: 检测到down_url数组，包含', data.down_url.length, '条药品匹配数据');
        const tableResult = formatExcelMaterialTable(data.down_url);
        if (tableResult) {
            console.log('formatCozeResponse: 使用Excel药品匹配表格格式');
            return tableResult;
        }
    }
    
    // 处理新的嵌套output格式：{ "output": [{ "outputList": [...], "rowNum": null }, ...] }
    if (data.output && Array.isArray(data.output)) {
        console.log('formatCozeResponse: 处理新的嵌套output格式');
        
        // 收集所有非空的outputList数据
        const allMaterials = [];
        data.output.forEach((item, index) => {
            if (item.outputList && Array.isArray(item.outputList) && item.outputList.length > 0) {
                console.log(`formatCozeResponse: 发现第${index}个输出项包含${item.outputList.length}条数据`);
                allMaterials.push(...item.outputList);
            }
        });
        
        console.log(`formatCozeResponse: 总共收集到${allMaterials.length}条物料数据`);
        
        if (allMaterials.length > 0) {
            // 优先使用简单表格格式（用于处理结果区域显示）
            const tableResult = formatMaterialTable(allMaterials);
            if (tableResult) {
                console.log('formatCozeResponse: 使用简单表格格式');
                return tableResult;
            }
            
            // 如果简单表格失败，尝试增强版表格
            const enhancedTableResult = formatEnhancedMaterialTable(allMaterials);
            if (enhancedTableResult) {
                console.log('formatCozeResponse: 使用增强版表格格式');
                return enhancedTableResult;
            }
        } else {
            formattedResult = '工作流处理完成，但未找到匹配的物料数据';
        }
    }
    // 处理旧的直接output格式（向后兼容）
    else if (data.output) {
        // 如果output是字符串，尝试解析为JSON并格式化为表格
        if (typeof data.output === 'string') {
            const tableResult = tryFormatAsTable(data.output);
            formattedResult = tableResult || data.output;
        } 
        // 如果output是对象，格式化显示其内容
        else if (typeof data.output === 'object') {
            // 如果是简单的键值对，优雅地显示
            const entries = Object.entries(data.output);
            if (entries.length === 1 && typeof entries[0][1] === 'string') {
                // 单个字符串值，尝试格式化为表格
                const tableResult = tryFormatAsTable(entries[0][1]);
                formattedResult = tableResult || entries[0][1];
            } else {
                // 多个字段或复杂对象，按键值对显示
                entries.forEach(([key, value]) => {
                    if (typeof value === 'string') {
                        formattedResult += `${key}：${value}\n`;
                    } else {
                        formattedResult += `${key}：${JSON.stringify(value, null, 2)}\n`;
                    }
                });
            }
        }
    }
    
    // 处理传统的文本内容格式（向后兼容）
    else if (data.content) {
        const tableResult = tryFormatAsTable(data.content);
        formattedResult = tableResult || data.content;
    }
    
    // 处理其他可能的数据字段
    else if (data.result) {
        const tableResult = tryFormatAsTable(data.result);
        formattedResult = tableResult || data.result;
    }
    
    // 如果有图片数据，添加到结果中
    if (data.images && data.images.length > 0) {
        if (formattedResult) {
            formattedResult += '\n\n';
        }
        formattedResult += '生成的图片：\n';
        data.images.forEach((image, index) => {
            formattedResult += `图片${index + 1}：${image.url || image}\n`;
        });
    }
    
    // 如果没有找到任何可显示的内容
    if (!formattedResult.trim()) {
        formattedResult = '工作流处理完成，但未返回可显示的内容';
    }
    
    return formattedResult.trim();
}

// 尝试将数据格式化为表格
function tryFormatAsTable(content) {
    if (!content || typeof content !== 'string') {
        console.log('tryFormatAsTable: 内容为空或不是字符串');
        return null;
    }
    
    console.log('tryFormatAsTable: 开始处理内容', content.substring(0, 100) + '...');
    
    // 检查是否是报价工作流的数据格式
    if (content.includes('### ID:') || (content.includes('物料:') && content.includes('规格:') && content.includes('生产厂家:'))) {
        console.log('tryFormatAsTable: 检测到报价工作流数据格式');
        const pricingResult = formatPricingTable(content);
        if (pricingResult) {
            console.log('tryFormatAsTable: 使用报价表格格式化成功');
            return pricingResult;
        }
    }
    
    try {
        // 尝试解析JSON数据
        let data;
        
        // 如果内容看起来像是带有编号的JSON对象列表
        const hasChineseColon = content.includes('：{');
        const hasEnglishColon = content.includes(': {');
        const hasBrace = content.includes('}');
        
        console.log('tryFormatAsTable: 格式检查', {
            hasChineseColon,
            hasEnglishColon,
            hasBrace,
            shouldProcess: (hasChineseColon || hasEnglishColon) && hasBrace
        });
        
        if ((hasChineseColon || hasEnglishColon) && hasBrace) {
            // 提取所有JSON对象 - 使用更强大的解析方法
            const jsonObjects = [];
            
            // 分割内容，寻找编号模式（支持中文冒号和英文冒号）
            const lines = content.split(/\d+[：:]\s*/);
            console.log('tryFormatAsTable: 分割后的行数', lines.length, '第一行:', lines[0]);
            
            for (let i = 1; i < lines.length; i++) {
                let jsonStr = lines[i].trim();
                
                // 移除末尾的逗号和其他字符
                jsonStr = jsonStr.replace(/,?\s*$/, '');
                
                // 如果不是以}结尾，尝试找到正确的结束位置
                if (!jsonStr.endsWith('}')) {
                    const braceCount = (jsonStr.match(/\{/g) || []).length - (jsonStr.match(/\}/g) || []).length;
                    if (braceCount > 0) {
                        // 需要添加缺失的大括号
                        jsonStr += '}';
                    }
                }
                
                console.log(`tryFormatAsTable: 尝试解析第${i}个对象:`, jsonStr.substring(0, 50) + '...');
                
                try {
                    const obj = JSON.parse(jsonStr);
                    jsonObjects.push(obj);
                    console.log(`tryFormatAsTable: 成功解析第${i}个对象`);
                } catch (e) {
                    console.log(`tryFormatAsTable: 第${i}个对象解析失败:`, e.message);
                    // 如果解析失败，尝试修复常见的JSON格式问题
                    try {
                        // 修复可能的引号问题
                        let fixedJson = jsonStr
                            .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // 添加属性名引号
                            .replace(/:\s*([^",\{\}\[\]]+)(\s*[,\}])/g, ':"$1"$2'); // 添加值引号
                        
                        console.log(`tryFormatAsTable: 尝试修复后的JSON:`, fixedJson.substring(0, 50) + '...');
                        const obj = JSON.parse(fixedJson);
                        jsonObjects.push(obj);
                        console.log(`tryFormatAsTable: 修复后成功解析第${i}个对象`);
                    } catch (e2) {
                        console.warn('无法解析JSON对象:', jsonStr, e2);
                    }
                }
            }
            
            if (jsonObjects.length > 0) {
                console.log('tryFormatAsTable: 成功解析', jsonObjects.length, '个对象，调用formatMaterialTable');
                return formatMaterialTable(jsonObjects);
            } else {
                console.log('tryFormatAsTable: 没有成功解析任何对象');
            }
        }
        
        console.log('tryFormatAsTable: 尝试直接解析为JSON');
        // 尝试直接解析为JSON
        data = JSON.parse(content);
        
        // 如果是数组，格式化为表格
        if (Array.isArray(data)) {
            console.log('tryFormatAsTable: 内容是数组，调用formatMaterialTable');
            return formatMaterialTable(data);
        }
        
        // 如果是单个对象，包装为数组
        if (typeof data === 'object' && data !== null) {
            console.log('tryFormatAsTable: 内容是对象，包装为数组后调用formatMaterialTable');
            return formatMaterialTable([data]);
        }
        
    } catch (e) {
        // 如果解析失败，返回null
        console.warn('tryFormatAsTable: 表格格式化失败:', e);
        return null;
    }
    
    console.log('tryFormatAsTable: 返回null');
    return null;
}

// 通用字符串数据处理函数
function processStringData(dataString, resultId) {
    console.log('🔧 processStringData: 开始处理字符串数据');
    console.log('🔧 resultId:', resultId);
    console.log('🔧 数据类型:', typeof dataString);
    
    try {
        // 尝试解析为JSON
        const jsonData = JSON.parse(dataString);
        console.log('🔧 JSON解析成功:', jsonData);
        
        // 检查是否包含down_url数组（药品匹配数据）
        if (jsonData && jsonData.down_url && Array.isArray(jsonData.down_url)) {
            console.log('🔧 检测到药品匹配数据，包含', jsonData.down_url.length, '条记录');
            console.log('🔧 down_url数组预览:', jsonData.down_url.slice(0, 2));
            console.log('🔧 调用formatExcelMaterialTable函数');
            const result = formatExcelMaterialTable(jsonData.down_url);
            console.log('🔧 formatExcelMaterialTable返回结果长度:', result ? result.length : 'null');
            console.log('🔧 返回结果预览:', result ? result.substring(0, 200) + '...' : 'null');
            return result;
        }
        
        // 检查是否是其他类型的数组数据
        if (Array.isArray(jsonData)) {
            console.log('🔧 检测到数组数据，尝试格式化为表格');
            return formatArrayAsTable(jsonData);
        }
        
        // 检查是否是对象数据
        if (typeof jsonData === 'object' && jsonData !== null) {
            console.log('🔧 检测到对象数据，尝试格式化为键值对表格');
            return formatObjectAsTable(jsonData);
        }
        
        // 如果是简单的JSON数据，格式化显示
        console.log('🔧 格式化为JSON显示');
        return `<pre class="json-display">${JSON.stringify(jsonData, null, 2)}</pre>`;
        
    } catch (error) {
        console.log('🔧 不是有效的JSON，尝试其他处理方式');
        
        // 检查是否包含HTML标签
        if (dataString.includes('<') && dataString.includes('>')) {
            console.log('🔧 检测到HTML内容，直接显示');
            return dataString;
        }
        
        // 特殊处理报价工作流数据
        console.log('🔧 检查报价数据条件:', {
            resultId: resultId,
            isPricingResult: resultId === 'pricing-result',
            hasIdMarkerChinese: dataString.includes('### ID：'),
            hasIdMarkerEnglish: dataString.includes('### ID:'),
            hasMaterialInfoChinese: dataString.includes('物料：') && dataString.includes('规格：') && dataString.includes('生产厂家：'),
            hasMaterialInfoEnglish: dataString.includes('物料:') && dataString.includes('规格:') && dataString.includes('生产厂家:'),
            hasMaterialInfoSpace: dataString.includes('物料 ') && dataString.includes('规格 ') && dataString.includes('生产厂家 '),
            hasBasicInfoPattern: /ID\s+\d+/.test(dataString) && dataString.includes('物料 ') && dataString.includes('规格 '),
            dataPreview: dataString.substring(0, 200)
        });
        
        if (resultId === 'pricing-result' && (
            dataString.includes('### ID：') || 
            dataString.includes('### ID:') || 
            (dataString.includes('物料：') && dataString.includes('规格：') && dataString.includes('生产厂家：')) || 
            (dataString.includes('物料:') && dataString.includes('规格:') && dataString.includes('生产厂家:')) ||
            (dataString.includes('物料 ') && dataString.includes('规格 ') && dataString.includes('生产厂家 ')) ||
            (/ID\s+\d+/.test(dataString) && dataString.includes('物料 ') && dataString.includes('规格 '))
        )) {
            console.log('🔧 检测到报价工作流数据格式，使用formatPricingTable');
            const pricingTableResult = formatPricingTable(dataString);
            if (pricingTableResult) {
                console.log('🔧 报价表格格式化成功');
                return pricingTableResult;
            } else {
                console.log('🔧 报价表格格式化失败，使用通用表格处理');
            }
        }
        
        // 检查是否是表格格式的文本
        if (dataString.includes('\t') || dataString.includes('|')) {
            console.log('🔧 检测到表格格式文本，转换为HTML表格');
            return formatTextAsTable(dataString);
        }
        
        // 默认格式化为预格式化文本
        console.log('🔧 格式化为预格式化文本');
        return `<pre class="text-display">${dataString}</pre>`;
    }
}

// 格式化数组为表格
function formatArrayAsTable(arrayData) {
    if (!arrayData || arrayData.length === 0) {
        return '<p class="no-data">暂无数据</p>';
    }
    
    // 如果数组元素是对象，创建表格
    if (typeof arrayData[0] === 'object') {
        const headers = Object.keys(arrayData[0]);
        let html = '<div class="table-container"><table class="data-table">';
        html += '<thead><tr>';
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        arrayData.forEach(item => {
            html += '<tr>';
            headers.forEach(header => {
                html += `<td>${item[header] || ''}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        return html;
    }
    
    // 如果是简单数组，创建列表
    let html = '<ul class="data-list">';
    arrayData.forEach(item => {
        html += `<li>${item}</li>`;
    });
    html += '</ul>';
    return html;
}

// 格式化对象为表格
function formatObjectAsTable(objectData) {
    let html = '<div class="table-container"><table class="data-table">';
    html += '<thead><tr><th>属性</th><th>值</th></tr></thead><tbody>';
    
    Object.keys(objectData).forEach(key => {
        const value = typeof objectData[key] === 'object' 
            ? JSON.stringify(objectData[key]) 
            : objectData[key];
        html += `<tr><td>${key}</td><td>${value}</td></tr>`;
    });
    
    html += '</tbody></table></div>';
    return html;
}

// 格式化文本为表格
function formatTextAsTable(textData) {
    const lines = textData.split('\n').filter(line => line.trim());
    if (lines.length === 0) return '<p class="no-data">暂无数据</p>';
    
    let html = '<div class="table-container"><table class="data-table">';
    
    lines.forEach((line, index) => {
        const cells = line.split(/\t|\|/).map(cell => cell.trim());
        if (index === 0) {
            html += '<thead><tr>';
            cells.forEach(cell => {
                html += `<th>${cell}</th>`;
            });
            html += '</tr></thead><tbody>';
        } else {
            html += '<tr>';
            cells.forEach(cell => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
        }
    });
    
    html += '</tbody></table></div>';
    return html;
}

// 专门处理Excel工作流数据的函数
function formatExcelWorkflowData(responseData) {
    console.log('formatExcelWorkflowData: 开始处理Excel工作流数据', responseData);
    
    try {
        let dataStr = null;
        
        // 检查多种可能的数据结构
        if (responseData && responseData.workflowResult && responseData.workflowResult.data) {
            // 原有的结构
            dataStr = responseData.workflowResult.data;
            console.log('formatExcelWorkflowData: 找到workflowResult.data');
        } else if (responseData && responseData.data) {
            // 直接在data字段中的结构
            dataStr = responseData.data;
            console.log('formatExcelWorkflowData: 找到直接data字段');
        } else if (typeof responseData === 'string') {
            // 如果responseData本身就是字符串
            dataStr = responseData;
            console.log('formatExcelWorkflowData: responseData本身是字符串');
        }
        
        if (dataStr) {
            console.log('formatExcelWorkflowData: 数据字符串前100字符:', dataStr.substring(0, 100) + '...');
            
            // 如果dataStr是字符串，尝试解析JSON
            let parsedData;
            if (typeof dataStr === 'string') {
                parsedData = JSON.parse(dataStr);
            } else {
                parsedData = dataStr;
            }
            
            console.log('formatExcelWorkflowData: 解析后的数据', parsedData);
            
            // 提取down_url数组
            if (parsedData && parsedData.down_url && Array.isArray(parsedData.down_url)) {
                const materials = parsedData.down_url;
                console.log('formatExcelWorkflowData: 找到', materials.length, '条数据');
                
                // 使用专门的Excel表格格式化函数
                return formatExcelMaterialTable(materials);
            }
        }
        
        // 如果不是预期的格式，尝试其他解析方式
        console.log('formatExcelWorkflowData: 未找到预期的数据结构');
        return null;
        
    } catch (error) {
        console.error('formatExcelWorkflowData: 解析失败', error);
        console.error('formatExcelWorkflowData: 原始数据', responseData);
        return null;
    }
}

// 报价计算函数
function calculateQuotePrice(material) {
    // 获取相关价格数据
    const assessmentPrice = parseFloat(material.assessment_price) || 0;
    const specificPrice = parseFloat(material.specific_price) || 0;
    const lastSalePrice = parseFloat(material.last_sale_price) || 0;
    const lastSaleDate = material.last_sale_date;
    
    console.log('计算报价 - 输入数据:', {
        assessmentPrice,
        specificPrice,
        lastSalePrice,
        lastSaleDate
    });
    
    // 如果没有考核价，无法计算报价
    if (assessmentPrice <= 0) {
        console.log('计算报价 - 无考核价，返回null');
        return null;
    }
    
    // 1. 基础报价计算：考核价 / 0.96
    let baseQuote = assessmentPrice / 0.96;
    
    // 2. 特殊舍入规则：保留两位小数
    baseQuote = applySpecialRounding(baseQuote);
    
    let finalQuote = baseQuote;
    
    // 3. 特定价优先逻辑：如果(特定价-考核价)/特定价 >= 4%，则使用特定价
    if (specificPrice > 0) {
        const priceDiffPercent = (specificPrice - assessmentPrice) / specificPrice;
        if (priceDiffPercent >= 0.04) {
            finalQuote = specificPrice;
        }
    }
    
    // 4. 上次销售价格逻辑
    if (lastSalePrice > 0 && lastSaleDate) {
        // 检查是否在近2个月内
        const currentDate = new Date();
        const saleDate = new Date(lastSaleDate);
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
        
        if (saleDate >= twoMonthsAgo && lastSalePrice > assessmentPrice) {
            // 如果上次销售价格大于考核价，使用上次销售价格
            finalQuote = lastSalePrice;
            
            // 但如果同时上次销售价格小于特定价，则保留特定价
            if (specificPrice > 0 && lastSalePrice < specificPrice) {
                const priceDiffPercent = (specificPrice - assessmentPrice) / specificPrice;
                if (priceDiffPercent >= 0.04) {
                    finalQuote = specificPrice;
                }
            }
        }
    }
    
    console.log('计算报价 - 最终结果:', {
        baseQuote,
        finalQuote,
        usedLogic: finalQuote === baseQuote ? '基础计算' : 
                  finalQuote === specificPrice ? '特定价优先' : 
                  finalQuote === lastSalePrice ? '上次销售价格' : '其他'
    });
    
    return finalQuote;
}

// 特殊舍入规则函数
function applySpecialRounding(value) {
    // 保留两位小数
    const rounded = Math.round(value * 100) / 100;
    
    // 获取小数部分
    const decimalPart = rounded.toString().split('.')[1] || '00';
    const secondDecimal = parseInt(decimalPart.charAt(1) || '0');
    
    // 应用特殊规则
    if (secondDecimal === 0 || secondDecimal === 5) {
        // 保留原值
        return rounded;
    } else if (secondDecimal < 5) {
        // 补为5
        const integerPart = Math.floor(rounded * 10) / 10;
        return integerPart + 0.05;
    } else {
        // 超过5则向前进一位
        const integerPart = Math.floor(rounded * 10) / 10;
        return integerPart + 0.1;
    }
}

// 专门为Excel工作流创建的表格格式化函数
function formatExcelMaterialTable(materials) {
    console.log('formatExcelMaterialTable: 开始格式化', materials.length, '条数据');
    
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
        return '<div class="no-data">暂无数据</div>';
    }
    
    // 定义列名映射（显示名称对应API字段名）
    const columnMapping = {
        // 客户信息
        '客户编码': '编码',
        '客户物料名称': '物料名称',
        '客户规格': '规格',
        '生产厂家': '生产厂家',
        '批准文号': '批准文号',
        '条形码': '条形码',
        
        // 系统信息
        '系统ID': 'uid',
        '系统物料名称': 'medicine_name',
        '系统规格': 'specifications',
        '生产厂家': 'manufacturer',
        
        // 价格信息
        '考核价': 'assessment_price',
        '报价': 'quote_price',
        '集合考核价': 'collective_price',
        '特定价': 'specific_price',
        '协议价': 'negotiated_price',
        '上次销价': 'last_sale_price',
        '上次销售日期': 'last_sale_date',
        
        // 库存和销售信息
        '赠品策略': 'giveaway_strategy',
        '可销库存': 'market_quantity',
        '是否禁销': 'prohibited_selling',
        
        // 日期信息
        '生产日期': 'manufacture_date',
        '有效期': 'expiration_date',
        '预计到货日期': 'product_arrival_date',
        '未入库数量': 'unstocked_quantity',
        
        // 系统标识信息
        '系统批准文号': 'approval_number',
        '条码': 'international_code',
        
        // 匹配信息
        '采购员': 'buyer',
        '匹配方式': 'match_type'
    };
    
    // 获取所有可能的列名
    const allColumns = new Set();
    materials.forEach(material => {
        Object.keys(material).forEach(key => allColumns.add(key));
    });
    
    // 按用户指定的优先级排序列名
    const priorityColumns = [
        // 客户信息
        '编码',
        '物料名称', 
        '规格',
        '生产厂家',
        '批准文号',
        '条形码',
        
        // 系统信息
        'uid',
        'medicine_name',
        'specifications', 
        'manufacturer',
        
        // 价格信息
        'assessment_price',
        'quote_price',
        'collective_price',
        'specific_price',
        'negotiated_price',
        'last_sale_price',
        'last_sale_date',
        
        // 库存和销售信息
        'giveaway_strategy',
        'market_quantity',
        'prohibited_selling',
        
        // 日期信息
        'manufacture_date',
        'expiration_date',
        'product_arrival_date',
        'unstocked_quantity',
        
        // 系统标识信息
        'approval_number',
        'international_code',
        
        // 匹配信息
        'buyer',
        'match_type'
    ];
    
    // 构建最终的列顺序
    const finalColumns = [];
    const usedColumns = new Set();
    
    // 先添加优先级列（如果存在）
    priorityColumns.forEach(col => {
        if (allColumns.has(col) && !usedColumns.has(col)) {
            finalColumns.push(col);
            usedColumns.add(col);
        }
    });
    
    // 再添加剩余的列
    Array.from(allColumns).forEach(col => {
        if (!usedColumns.has(col)) {
            finalColumns.push(col);
        }
    });
    
    console.log('formatExcelMaterialTable: 最终列顺序', finalColumns);
    
    // 生成表格HTML
    let html = '<div class="table-container">';
    html += '<table class="material-table excel-table">';
    
    // 表头
    html += '<thead><tr>';
    finalColumns.forEach(column => {
        // 查找对应的显示名称（从映射中查找key对应的value为当前column的项）
        const displayName = Object.keys(columnMapping).find(key => columnMapping[key] === column) || column;
        html += `<th>${displayName}</th>`;
    });
    html += '</tr></thead>';
    
    // 表体
    html += '<tbody>';
    materials.forEach((material, index) => {
        // 计算报价
        material.quote_price = calculateQuotePrice(material);
        
        // 根据匹配类型添加不同的行样式
        const matchType = material.match_type || material['匹配类型'] || '';
        const rowClass = matchType === '未匹配' ? 'unmatched-row' : 'matched-row';
        
        html += `<tr class="${rowClass}">`;
        finalColumns.forEach(column => {
            const value = material[column];
            let displayValue = '';
            
            if (value === null || value === undefined || value === '') {
                displayValue = '-';
            } else if (column === 'product_arrival_date' || column === '预计到货日期') {
                // 特殊处理预计到货日期：过滤无效日期
                const dateStr = String(value);
                if (dateStr.includes('0001-01-01') || dateStr.startsWith('0001-') || dateStr === '0001-01-01') {
                    displayValue = '-';
                } else if (dateStr.includes('00:00:00')) {
                    displayValue = dateStr.split(' ')[0];
                } else {
                    displayValue = dateStr;
                }
            } else if (column === 'unstocked_quantity' || column === '未入库数量') {
                // 特殊处理未入库数量：为0时不显示
                const numValue = parseFloat(value);
                if (numValue === 0 || isNaN(numValue)) {
                    displayValue = '-';
                } else {
                    displayValue = numValue.toLocaleString();
                }
            } else if (typeof value === 'number') {
                // 格式化数字
                if (column.includes('price') || column.includes('价格')) {
                    // 价格只显示数字，不显示符号
                    displayValue = value === 0 ? '-' : value.toFixed(2);
                } else if (column === 'uid' || column === '系统ID') {
                    // 系统ID不使用千分位分隔符
                    displayValue = String(value);
                } else {
                    displayValue = value.toLocaleString();
                }
            } else if (typeof value === 'string' && value.includes('00:00:00')) {
                // 格式化日期
                displayValue = value.split(' ')[0];
            } else {
                displayValue = String(value);
            }
            
            // 为特殊列添加样式
            let cellClass = '';
            if (column === 'match_type' || column === '匹配类型') {
                cellClass = matchType === '未匹配' ? 'match-status unmatched' : 'match-status matched';
            } else if (column.includes('price') || column.includes('价格')) {
                cellClass = 'price-cell';
            }
            
            html += `<td class="${cellClass}">${displayValue}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    html += '</table>';
    html += '</div>';
    
    // 添加统计信息
    const matchedCount = materials.filter(m => (m.match_type || m['匹配类型']) !== '未匹配').length;
    const unmatchedCount = materials.length - matchedCount;
    
    html += '<div class="table-summary">';
    html += `<div class="summary-item">总计: <strong>${materials.length}</strong> 条</div>`;
    html += `<div class="summary-item matched">已匹配: <strong>${matchedCount}</strong> 条</div>`;
    html += `<div class="summary-item unmatched">未匹配: <strong>${unmatchedCount}</strong> 条</div>`;
    html += '</div>';
    
    console.log('formatExcelMaterialTable: 表格生成完成');
    return html;
}

// 格式化物料数据为表格
function formatMaterialTable(materials) {
    console.log('formatMaterialTable: 开始处理', materials.length, '条物料数据');
    
    if (!Array.isArray(materials) || materials.length === 0) {
        console.log('formatMaterialTable: 数据为空或不是数组');
        return null;
    }
    
    // 定义表头映射 - 按用户指定的顺序
    const columnMapping = [
        { header: '物料ID', field: 'uid' },
        { header: '物料名称', field: 'medicine_name' },
        { header: '规格', field: 'specification' },
        { header: '生产厂家', field: 'manufacturers' },
        { header: '采购员', field: 'goods_buyer' },
        { header: '批准文号', field: 'approval_number' },
        { header: '国际条形码', field: 'international_code' },
        { header: '商品名', field: 'commonly_name' },
        { header: '药剂类型', field: 'medicine_type' }
    ];
    
    console.log('formatMaterialTable: 第一条数据示例:', materials[0]);
    
    // 创建HTML表格
    let tableHTML = '<div class="material-table-container">\n';
    tableHTML += '<table class="material-table">\n';
    
    // 创建表头
    tableHTML += '<thead>\n<tr>\n';
    columnMapping.forEach(col => {
        tableHTML += `<th>${col.header}</th>\n`;
    });
    tableHTML += '</tr>\n</thead>\n';
    
    // 创建表体
    tableHTML += '<tbody>\n';
    materials.forEach((material, index) => {
        console.log(`formatMaterialTable: 处理第${index + 1}条数据:`, material.uid, material.medicine_name);
        tableHTML += '<tr>\n';
        columnMapping.forEach(col => {
            const value = material[col.field] || '';
            tableHTML += `<td>${value}</td>\n`;
        });
        tableHTML += '</tr>\n';
    });
    tableHTML += '</tbody>\n';
    
    tableHTML += '</table>\n</div>';
    
    console.log('formatMaterialTable: 生成的HTML长度:', tableHTML.length);
    console.log('formatMaterialTable: HTML预览:', tableHTML.substring(0, 200) + '...');
    
    return tableHTML;
}

// 格式化报价数据为表格
function formatPricingTable(content) {
    console.log('🎯 formatPricingTable: 开始处理报价数据 [版本: 多产品支持 v2.0]');
    console.log('🎯 formatPricingTable: 内容类型:', typeof content);
    console.log('🎯 formatPricingTable: 内容长度:', content ? content.length : 0);
    console.log('🎯 formatPricingTable: 内容预览:', content ? content.substring(0, 300) + '...' : 'null');
    
    if (!content || typeof content !== 'string') {
        console.log('formatPricingTable: 内容为空或不是字符串');
        return null;
    }
    
    try {
        // 首先按产品分割数据 - 查找所有以 "### ID：" 开头的行
        const productSections = [];
        const lines = content.split('\n');
        
        let currentProductStart = -1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 检测新产品的开始
            if (line.includes('### ID：') || line.includes('### ID:')) {
                // 如果之前有产品，保存它
                if (currentProductStart >= 0) {
                    const productContent = lines.slice(currentProductStart, i).join('\n');
                    productSections.push(productContent);
                }
                currentProductStart = i;
            }
        }
        
        // 保存最后一个产品
        if (currentProductStart >= 0) {
            const productContent = lines.slice(currentProductStart).join('\n');
            productSections.push(productContent);
        }
        
        console.log(`🎯 formatPricingTable: 发现 ${productSections.length} 个产品`);
        
        // 打印每个产品的内容预览
        productSections.forEach((section, index) => {
            console.log(`🎯 formatPricingTable: 产品 ${index + 1} 内容预览:`, section.substring(0, 100) + '...');
        });
        
        // 如果没有找到产品分割，按原来的方式处理
        if (productSections.length === 0) {
            console.log('🎯 formatPricingTable: 未找到产品分割，使用整个内容');
            productSections.push(content);
        }
        
        // 处理每个产品的数据
        let allProductsHTML = '<div class="pricing-table-container">\n';
        
        productSections.forEach((productContent, productIndex) => {
            console.log(`🎯 formatPricingTable: 处理第 ${productIndex + 1} 个产品`);
            
            const productHTML = formatSingleProductData(productContent, productIndex);
            if (productHTML) {
                allProductsHTML += productHTML;
                
                // 在产品之间添加分隔线（除了最后一个产品）
                if (productIndex < productSections.length - 1) {
                    allProductsHTML += '<div class="product-divider"></div>\n';
                }
            }
        });
        
        allProductsHTML += '</div>';
        
        console.log('🎯 formatPricingTable: 生成的HTML长度:', allProductsHTML.length);
        return allProductsHTML;
        
    } catch (error) {
        console.error('formatPricingTable: 格式化失败:', error);
        return null;
    }
}

// 处理单个产品数据的函数
function formatSingleProductData(content, productIndex = 0) {
    console.log(`🎯 formatSingleProductData: 处理产品 ${productIndex + 1}`);
    
    if (!content || typeof content !== 'string') {
        return null;
    }
    
    try {
        // 解析报价数据的结构
        const lines = content.split('\n').filter(line => line.trim());
        
        // 查找关键信息
        let basicInfo = {
            id: '',
            material: '',
            specification: '',
            manufacturer: ''
        };
        let salesData = [];
        let analysisData = [];
        let quoteSuggestions = [];
        let riskOpportunities = [];
        
        let currentSection = '';
        let processedLines = new Set(); // 防止重复处理
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // 跳过已处理的行
            if (processedLines.has(i)) continue;
            
            // 特殊处理第一行的管道符分隔数据
            if (line.includes('### ID') && line.includes('|')) {
                console.log('formatSingleProductData: 处理管道符分隔的基本信息行:', line);
                const parts = line.split('|').map(part => part.trim());
                
                for (let part of parts) {
                    if (part.includes('ID：') || part.includes('ID:')) {
                        basicInfo.id = part.replace(/.*ID[：:]\s*/, '').trim();
                    } else if (part.includes('物料：') || part.includes('物料:')) {
                        basicInfo.material = part.replace(/.*物料[：:]\s*/, '').trim();
                    } else if (part.includes('规格：') || part.includes('规格:')) {
                        basicInfo.specification = part.replace(/.*规格[：:]\s*/, '').trim();
                    } else if (part.includes('生产厂家：') || part.includes('生产厂家:')) {
                        basicInfo.manufacturer = part.replace(/.*生产厂家[：:]\s*/, '').trim();
                    }
                }
                processedLines.add(i);
                continue;
            }
            
            // 解析ID (支持中英文冒号和空格分隔)
            if (line.includes('### ID：') || line.includes('### ID:') || line.includes('ID：') || line.includes('ID:')) {
                basicInfo.id = line.replace(/.*ID[：:]\s*/, '').trim();
                processedLines.add(i);
                continue;
            }
            
            // 识别章节标题
            if (line.includes('#### 销售数据概况') || line.includes('销售数据概况')) {
                currentSection = 'sales';
                processedLines.add(i);
                continue;
            }
            
            if (line.includes('#### 分析') || line.includes('### 分析') || line === '#### 分析') {
                currentSection = 'analysis';
                processedLines.add(i);
                continue;
            }
            
            if (line.includes('#### 报价建议') || line.includes('报价建议')) {
                currentSection = 'quote';
                processedLines.add(i);
                continue;
            }
            
            if (line.includes('#### 风险与机会') || line.includes('风险与机会')) {
                currentSection = 'risk';
                processedLines.add(i);
                continue;
            }
            
            // 收集各部分数据
            if (currentSection === 'sales' && line && !line.includes('#### ')) {
                let cleanLine = line.replace(/^[-*•]\s*/, '').trim();
                if (cleanLine && !salesData.includes(cleanLine)) {
                    salesData.push(cleanLine);
                }
                processedLines.add(i);
            } else if (currentSection === 'analysis' && line && !line.includes('#### ')) {
                let cleanLine = line.replace(/^[-*•]\s*/, '').trim();
                if (cleanLine && !analysisData.includes(cleanLine)) {
                    analysisData.push(cleanLine);
                }
                processedLines.add(i);
            } else if (currentSection === 'quote' && line && !line.includes('#### ')) {
                let cleanLine = line.replace(/^[-*•]\s*/, '').trim();
                if (cleanLine && !quoteSuggestions.includes(cleanLine)) {
                    quoteSuggestions.push(cleanLine);
                }
                processedLines.add(i);
            } else if (currentSection === 'risk' && line && !line.includes('#### ')) {
                let cleanLine = line.replace(/^[-*•]\s*/, '').trim();
                if (cleanLine && !riskOpportunities.includes(cleanLine)) {
                    riskOpportunities.push(cleanLine);
                }
                processedLines.add(i);
            }
        }
        
        // 生成单个产品的HTML
        let productHTML = '<div class="single-product-container">\n';
        
        // 产品标题
        if (basicInfo.id || basicInfo.material) {
            productHTML += '<div class="product-title">\n';
            productHTML += '<h3>';
            if (basicInfo.id) productHTML += `ID: ${basicInfo.id}`;
            if (basicInfo.material) productHTML += ` - ${basicInfo.material}`;
            productHTML += '</h3>\n';
            productHTML += '</div>\n';
        }
        
        // 基本信息表格
        productHTML += '<div class="pricing-basic-info">\n';
        productHTML += '<div class="section-header">\n';
        productHTML += '<h4><span class="section-icon">📋</span>基本信息</h4>\n';
        productHTML += '</div>\n';
        productHTML += '<table class="pricing-info-table">\n';
        productHTML += '<tbody>\n';
        
        if (basicInfo.id) productHTML += `<tr><td class="label">ID</td><td class="value">${basicInfo.id}</td></tr>\n`;
        if (basicInfo.material) productHTML += `<tr><td class="label">物料</td><td class="value">${basicInfo.material}</td></tr>\n`;
        if (basicInfo.specification) productHTML += `<tr><td class="label">规格</td><td class="value">${basicInfo.specification}</td></tr>\n`;
        if (basicInfo.manufacturer) productHTML += `<tr><td class="label">生产厂家</td><td class="value">${basicInfo.manufacturer}</td></tr>\n`;
        
        productHTML += '</tbody>\n</table>\n</div>\n';
        
        // 添加分隔线
        productHTML += '<div class="section-divider"></div>\n';
        
        // 销售数据表格
        if (salesData.length > 0) {
            productHTML += '<div class="pricing-sales-data">\n';
            productHTML += '<div class="section-header">\n';
            productHTML += '<h4><span class="section-icon">📊</span>销售数据概况</h4>\n';
            productHTML += '</div>\n';
            productHTML += '<table class="pricing-data-table">\n';
            productHTML += '<tbody>\n';
            
            // 去重并处理销售数据
            const uniqueSalesData = [...new Set(salesData)];
            console.log(`formatSingleProductData: 产品 ${productIndex + 1} 销售数据条数:`, uniqueSalesData.length);
            
            uniqueSalesData.forEach((data, index) => {
                console.log(`formatSingleProductData: 处理销售数据 ${index + 1}:`, data);
                
                // 解析键值对 (支持中英文冒号)
                const chineseColonIndex = data.indexOf('：');
                const englishColonIndex = data.indexOf(':');
                let colonIndex = -1;
                
                if (chineseColonIndex > 0 && englishColonIndex > 0) {
                    colonIndex = Math.min(chineseColonIndex, englishColonIndex);
                } else if (chineseColonIndex > 0) {
                    colonIndex = chineseColonIndex;
                } else if (englishColonIndex > 0) {
                    colonIndex = englishColonIndex;
                }
                
                if (colonIndex > 0) {
                    const key = data.substring(0, colonIndex).replace(/\*+/g, '').trim();
                    const value = data.substring(colonIndex + 1).trim();
                    productHTML += `<tr><td class="label">${key}</td><td class="value">${value}</td></tr>\n`;
                } else {
                    productHTML += `<tr><td colspan="2" class="full-width">${data}</td></tr>\n`;
                }
            });
            
            productHTML += '</tbody>\n</table>\n</div>\n';
            
            // 添加分隔线
            productHTML += '<div class="section-divider"></div>\n';
        }
        
        // 分析表格
        if (analysisData.length > 0) {
            productHTML += '<div class="pricing-analysis">\n';
            productHTML += '<div class="section-header">\n';
            productHTML += '<h4><span class="section-icon">🔍</span>分析</h4>\n';
            productHTML += '</div>\n';
            productHTML += '<table class="pricing-analysis-table">\n';
            productHTML += '<tbody>\n';
            
            // 去重并处理分析数据
            const uniqueAnalysisData = [...new Set(analysisData)];
            console.log(`formatSingleProductData: 产品 ${productIndex + 1} 分析数据条数:`, uniqueAnalysisData.length);
            
            uniqueAnalysisData.forEach((item, index) => {
                console.log(`formatSingleProductData: 处理分析数据 ${index + 1}:`, item);
                
                // 解析键值对 (支持中英文冒号)
                const chineseColonIndex = item.indexOf('：');
                const englishColonIndex = item.indexOf(':');
                let colonIndex = -1;
                
                if (chineseColonIndex > 0 && englishColonIndex > 0) {
                    colonIndex = Math.min(chineseColonIndex, englishColonIndex);
                } else if (chineseColonIndex > 0) {
                    colonIndex = chineseColonIndex;
                } else if (englishColonIndex > 0) {
                    colonIndex = englishColonIndex;
                }
                
                if (colonIndex > 0) {
                    const key = item.substring(0, colonIndex).replace(/\*+/g, '').trim();
                    const value = item.substring(colonIndex + 1).trim();
                    productHTML += `<tr><td class="label">${key}</td><td class="value">${value}</td></tr>\n`;
                } else {
                    productHTML += `<tr><td colspan="2" class="full-width">${item}</td></tr>\n`;
                }
            });
            
            productHTML += '</tbody>\n</table>\n</div>\n';
        }
        
        productHTML += '</div>';
        
        return productHTML;
        
    } catch (error) {
        console.error('formatPricingTable: 格式化失败:', error);
        return null;
    }
}

// 尝试格式化为增强表格（专门用于详细查看模态框）
// 专门处理Excel表格数据的函数
function parseExcelTableData(content) {
    console.log('parseExcelTableData: 开始解析Excel表格数据');
    
    if (typeof content !== 'string') {
        return null;
    }
    
    // 检查是否包含Excel表格的特征字段
    const excelHeaders = ['客户编码', '客户物料名称', '客户规格', '生产厂家', '批准文号', '条形码', '系统ID', '系统物料名称', '系统规格', '考核价', '报价', '集合考核价', '特定价', '协议价', '上次销价', '上次销售日期', '赠品策略', '可销库存', '是否禁销', '生产日期', '有效期', '预计到货日期', '未入库数量', '系统批准文号', '条码', 'buyermatch_type'];
    
    const hasExcelHeaders = excelHeaders.some(header => content.includes(header));
    if (!hasExcelHeaders) {
        console.log('parseExcelTableData: 未发现Excel表格特征');
        return null;
    }
    
    console.log('parseExcelTableData: 发现Excel表格数据，开始解析');
    
    // 定义表头
    const headers = [
        '客户编码', '客户物料名称', '客户规格', '生产厂家', '批准文号', '条形码',
        '系统ID', '系统物料名称', '系统规格', '生产厂家', '考核价', '报价',
        '集合考核价', '特定价', '协议价', '上次销价', '上次销售日期', '赠品策略',
        '可销库存', '是否禁销', '生产日期', '有效期', '预计到货日期', '未入库数量',
        '系统批准文号', '条码', 'buyermatch_type'
    ];
    
    // 尝试解析数据行
    const rows = [];
    
    // 移除表头部分，查找数据开始位置
    let dataStart = content.indexOf('buyermatch_type');
    if (dataStart === -1) {
        console.log('parseExcelTableData: 未找到数据开始标记');
        return null;
    }
    
    // 从数据开始位置后查找实际数据
    const dataContent = content.substring(dataStart + 'buyermatch_type'.length);
    
    // 使用正则表达式分割数据行
    // 假设数据以"-"开头的行为新的数据行
    const dataLines = dataContent.split(/(?=-[^-])/);
    
    for (let line of dataLines) {
        line = line.trim();
        if (!line || line === '-') continue;
        
        // 解析每一行数据
        const rowData = parseExcelRow(line, headers);
        if (rowData && rowData.length > 0) {
            rows.push(rowData);
        }
    }
    
    if (rows.length === 0) {
        console.log('parseExcelTableData: 未解析到有效数据行');
        return null;
    }
    
    console.log(`parseExcelTableData: 成功解析${rows.length}行数据`);
    return { headers, rows };
}

// 解析单行Excel数据
function parseExcelRow(line, headers) {
    if (!line || line.trim() === '') return null;
    
    // 移除开头的"-"
    line = line.replace(/^-+/, '').trim();
    
    const row = [];
    let currentValue = '';
    let headerIndex = 0;
    
    // 简化的解析逻辑：按照已知的数据模式分割
    // 这里需要根据实际数据格式调整
    const parts = line.split(/(?=[A-Z]\d+|国药准字|未匹配|[\u4e00-\u9fa5]+国际代码)/);
    
    // 如果解析失败，尝试其他方法
    if (parts.length < 5) {
        // 备用解析方法：按照特定模式分割
        const values = [];
        let temp = line;
        
        // 提取一些关键字段
        const patterns = [
            /^([^-]*?)(?=[\u4e00-\u9fa5])/,  // 客户编码
            /[\u4e00-\u9fa5][^0-9]*?(?=\d+[gGmMlL]|\d+片|\d+粒|\d+支|\d+袋)/,  // 物料名称
            /\d+[gGmMlL][^A-Z]*?(?=[A-Z]|国药准字|$)/,  // 规格
        ];
        
        // 简化处理：将整行作为一个数据项
        return [line];
    }
    
    return parts.filter(part => part.trim() !== '');
}

// 将Excel表格数据格式化为HTML
function formatExcelTableAsHTML(tableData) {
    console.log('formatExcelTableAsHTML: 开始格式化Excel表格');
    console.log('formatExcelTableAsHTML: tableData类型:', typeof tableData);
    console.log('formatExcelTableAsHTML: tableData:', tableData);
    
    if (!tableData || !tableData.headers || !tableData.rows) {
        console.log('formatExcelTableAsHTML: 数据验证失败 - tableData:', !!tableData, 'headers:', !!tableData?.headers, 'rows:', !!tableData?.rows);
        return null;
    }
    
    const { headers, rows } = tableData;
    console.log('formatExcelTableAsHTML: headers数量:', headers.length);
    console.log('formatExcelTableAsHTML: rows数量:', rows.length);
    console.log('formatExcelTableAsHTML: 第一行数据:', rows[0]);
    
    // 使用与formatExcelMaterialTable相同的列映射和排序逻辑
    const columnMapping = {
        // 客户信息
        '客户编码': '编码',
        '客户物料名称': '物料名称',
        '客户规格': '规格',
        '生产厂家': '生产厂家',
        '批准文号': '批准文号',
        '条形码': '条形码',
        
        // 系统信息
        '系统ID': 'uid',
        '系统物料名称': 'medicine_name',
        '系统规格': 'specifications',
        '生产厂家': 'manufacturer',
        
        // 价格信息
        '考核价': 'assessment_price',
        '报价': 'quote_price',
        '集合考核价': 'collective_price',
        '特定价': 'specific_price',
        '协议价': 'negotiated_price',
        '上次销价': 'last_sale_price',
        '上次销售日期': 'last_sale_date',
        
        // 库存和销售信息
        '赠品策略': 'giveaway_strategy',
        '可销库存': 'market_quantity',
        '是否禁销': 'prohibited_selling',
        
        // 日期信息
        '生产日期': 'manufacture_date',
        '有效期': 'expiration_date',
        '预计到货日期': 'product_arrival_date',
        '未入库数量': 'unstocked_quantity',
        
        // 系统标识信息
        '系统批准文号': 'approval_number',
        '条码': 'international_code',
        
        // 其他信息
        '采购员': 'buyer',
        '匹配方式': 'match_type'
    };
    
    // 按用户指定的正确列名顺序排序
    const priorityColumns = [
        // 按照用户提供的正确顺序
        '编码',           // 客户编码
        '物料名称',       // 客户物料名称
        '规格',           // 客户规格
        '生产厂家',       // 生产厂家
        '批准文号',       // 批准文号
        '条形码',         // 条形码
        'uid',            // 系统ID
        'medicine_name',  // 系统物料名称
        'specifications', // 系统规格
        'manufacturer',   // 生产厂家
        'assessment_price', // 考核价
        'quote_price',    // 报价
        'collective_price', // 集合考核价
        'specific_price', // 特定价
        'negotiated_price', // 协议价
        'last_sale_price', // 上次销价
        'last_sale_date', // 上次销售日期
        'giveaway_strategy', // 赠品策略
        'market_quantity', // 可销库存
        'prohibited_selling', // 是否禁销
        'manufacture_date', // 生产日期
        'expiration_date', // 有效期
        'product_arrival_date', // 预计到货日期
        'unstocked_quantity', // 未入库数量
        'approval_number', // 系统批准文号
        'international_code', // 条码
        'buyer',          // buyer
        'match_type'      // match_type
    ];
    
    // 构建最终的列顺序
    const allColumns = new Set(headers);
    const finalColumns = [];
    const usedColumns = new Set();
    
    // 先添加优先级列（如果存在）
    priorityColumns.forEach(col => {
        if (allColumns.has(col) && !usedColumns.has(col)) {
            finalColumns.push(col);
            usedColumns.add(col);
        }
    });
    
    // 再添加剩余的列
    headers.forEach(col => {
        if (!usedColumns.has(col)) {
            finalColumns.push(col);
        }
    });
    
    console.log('formatExcelTableAsHTML: 最终列顺序', finalColumns);
    
    let html = '<div class="enhanced-table-container">';
    html += '<h3 class="table-title">Excel数据详细查看</h3>';
    html += '<table class="enhanced-table">';
    
    // 表头
    html += '<thead><tr>';
    finalColumns.forEach(column => {
        // 查找对应的显示名称（从映射中查找key对应的value为当前column的项）
        const displayName = Object.keys(columnMapping).find(key => columnMapping[key] === column) || column;
        html += `<th>${escapeHtml(displayName)}</th>`;
    });
    html += '</tr></thead>';
    
    // 表体
    html += '<tbody>';
    rows.forEach((row, index) => {
        html += '<tr>';
        
        // 如果行数据只有一个元素（简化解析的结果），需要特殊处理
        if (row.length === 1) {
            // 将单行数据分割到多个列中
            const singleRowData = row[0];
            const parsedRow = parseDetailedExcelRow(singleRowData);
            
            finalColumns.forEach((column, colIndex) => {
                const cell = parsedRow[column] || '-';
                let cellClass = '';
                let displayValue = cell;
                
                // 根据列类型添加样式和格式化数据
                if (column === '编码' || column.includes('编码') || column === 'uid') {
                    cellClass = 'code-column';
                } else if (column === '物料名称' || column === 'medicine_name' || column.includes('名称')) {
                    cellClass = 'name-column';
                } else if (column === '规格' || column === 'specifications' || column.includes('规格')) {
                    cellClass = 'spec-column';
                } else if (column === '生产厂家' || column === 'manufacturer' || column.includes('厂家')) {
                    cellClass = 'manufacturer-column';
                } else if (column === '批准文号' || column === 'approval_number' || column.includes('批准文号')) {
                    cellClass = 'approval-column';
                } else if (column === '条形码' || column === 'international_code' || column.includes('条码')) {
                    cellClass = 'barcode-column';
                } else if (column.includes('price') || column.includes('价格') || column.includes('价')) {
                    cellClass = 'price-column';
                    // 格式化价格
                    const numValue = parseFloat(cell);
                    if (!isNaN(numValue) && numValue > 0) {
                        displayValue = numValue.toFixed(2);
                    } else {
                        displayValue = '-';
                    }
                } else if (column.includes('date') || column.includes('日期')) {
                    cellClass = 'date-column';
                    // 格式化日期
                    if (cell && cell.includes('00:00:00')) {
                        displayValue = cell.split(' ')[0];
                    } else if (cell && (cell.includes('0001-01-01') || cell.startsWith('0001-'))) {
                        displayValue = '-';
                    }
                } else if (column.includes('quantity') || column.includes('库存') || column.includes('数量')) {
                    cellClass = 'stock-column';
                    // 格式化数量
                    const numValue = parseFloat(cell);
                    if (!isNaN(numValue) && numValue > 0) {
                        displayValue = numValue.toLocaleString();
                    } else {
                        displayValue = '-';
                    }
                }
                
                html += `<td class="${cellClass}">${escapeHtml(displayValue)}</td>`;
            });
        } else {
            // 正常的多列数据
            finalColumns.forEach((column, colIndex) => {
                // 找到原始headers中的索引
                const originalIndex = headers.indexOf(column);
                const cell = originalIndex >= 0 ? row[originalIndex] : '-';
                
                let cellClass = '';
                let displayValue = cell || '-';
                
                // 根据列类型添加样式和格式化数据
                if (column === '编码' || column.includes('编码') || column === 'uid') {
                    cellClass = 'code-column';
                } else if (column === '物料名称' || column === 'medicine_name' || column.includes('名称')) {
                    cellClass = 'name-column';
                } else if (column === '规格' || column === 'specifications' || column.includes('规格')) {
                    cellClass = 'spec-column';
                } else if (column === '生产厂家' || column === 'manufacturer' || column.includes('厂家')) {
                    cellClass = 'manufacturer-column';
                } else if (column === '批准文号' || column === 'approval_number' || column.includes('批准文号')) {
                    cellClass = 'approval-column';
                } else if (column === '条形码' || column === 'international_code' || column.includes('条码')) {
                    cellClass = 'barcode-column';
                } else if (column.includes('price') || column.includes('价格') || column.includes('价')) {
                    cellClass = 'price-column';
                    // 格式化价格
                    const numValue = parseFloat(cell);
                    if (!isNaN(numValue) && numValue > 0) {
                        displayValue = numValue.toFixed(2);
                    } else {
                        displayValue = '-';
                    }
                } else if (column.includes('date') || column.includes('日期')) {
                    cellClass = 'date-column';
                    // 格式化日期
                    if (cell && cell.includes('00:00:00')) {
                        displayValue = cell.split(' ')[0];
                    } else if (cell && (cell.includes('0001-01-01') || cell.startsWith('0001-'))) {
                        displayValue = '-';
                    }
                } else if (column.includes('quantity') || column.includes('库存') || column.includes('数量')) {
                    cellClass = 'stock-column';
                    // 格式化数量
                    const numValue = parseFloat(cell);
                    if (!isNaN(numValue) && numValue > 0) {
                        displayValue = numValue.toLocaleString();
                    } else {
                        displayValue = '-';
                    }
                }
                
                html += `<td class="${cellClass}">${escapeHtml(displayValue)}</td>`;
            });
        }
        
        html += '</tr>';
    });
    html += '</tbody>';
    
    html += '</table>';
    html += '</div>';
    
    console.log(`formatExcelTableAsHTML: 生成了包含${rows.length}行数据的表格`);
    return html;
}

// 详细解析Excel行数据
function parseDetailedExcelRow(rowData) {
    console.log('parseDetailedExcelRow: 解析行数据，类型:', typeof rowData);
    console.log('parseDetailedExcelRow: 原始数据:', rowData);
    
    // 如果rowData是对象，直接返回该对象
    if (typeof rowData === 'object' && rowData !== null) {
        console.log('parseDetailedExcelRow: 数据是对象格式，直接返回');
        return rowData;
    }
    
    // 如果rowData不是字符串，直接返回空对象
    if (typeof rowData !== 'string') {
        console.log('parseDetailedExcelRow: 数据类型不是字符串也不是对象，返回空对象');
        return {};
    }
    
    // 定义列名顺序（与formatExcelTableAsHTML中的priorityColumns一致）
    const columnNames = [
        '编码', '物料名称', '规格', '生产厂家', '批准文号', '条形码',
        'uid', 'medicine_name', 'specifications', 'manufacturer',
        'assessment_price', 'quote_price', 'collective_price', 'specific_price',
        'negotiated_price', 'last_sale_price', 'last_sale_date', 'giveaway_strategy',
        'market_quantity', 'prohibited_selling', 'manufacture_date', 'expiration_date',
        'product_arrival_date', 'unstocked_quantity', 'approval_number', 'international_code',
        'buyer', 'match_type'
    ];
    
    const result = {};
    
    try {
        // 简单的分割方式，使用制表符或多个空格
        const parts = rowData.split(/\t+|\s{2,}/).filter(part => part.trim() !== '');
        console.log('parseDetailedExcelRow: 分割后的数据部分数量:', parts.length);
        
        // 为每个列名设置默认值
        columnNames.forEach((columnName, index) => {
            result[columnName] = parts[index] || '-';
        });
        
        // 如果数据不够，尝试简单的智能解析
        if (parts.length < columnNames.length) {
            console.log('parseDetailedExcelRow: 数据不完整，尝试简单解析');
            
            // 提取一些关键信息
            if (parts.length > 0) {
                result['物料名称'] = parts[0] || '-';
            }
            if (parts.length > 1) {
                result['规格'] = parts[1] || '-';
            }
            if (parts.length > 2) {
                result['生产厂家'] = parts[2] || '-';
            }
            
            // 提取数字信息作为价格
            const numbers = rowData.match(/\d+\.?\d*/g) || [];
            if (numbers.length > 0) {
                result['assessment_price'] = numbers[0] || '-';
            }
            if (numbers.length > 1) {
                result['quote_price'] = numbers[1] || '-';
            }
        }
        
    } catch (error) {
        console.error('parseDetailedExcelRow: 解析过程中出错:', error);
        // 出错时返回基本的空值结构
        columnNames.forEach(columnName => {
            result[columnName] = '-';
        });
    }
    
    console.log('parseDetailedExcelRow: 解析结果字段数量:', Object.keys(result).length);
    return result;
}

// HTML转义函数
function escapeHtml(text) {
    if (typeof text !== 'string') {
        return String(text);
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function tryFormatAsEnhancedTable(content) {
    console.log('tryFormatAsEnhancedTable: 开始处理内容');
    
    if (!content) {
        console.log('tryFormatAsEnhancedTable: 内容为空');
        return null;
    }
    
    // 首先尝试解析Excel表格数据
    if (typeof content === 'string') {
        const excelTableData = parseExcelTableData(content);
        if (excelTableData) {
            console.log('tryFormatAsEnhancedTable: 使用Excel表格解析器');
            return formatExcelTableAsHTML(excelTableData);
        }
    }
    
    // 如果content是对象，尝试提取数据
    if (typeof content === 'object') {
        console.log('tryFormatAsEnhancedTable: 处理对象数据');
        
        // 检查Excel工作流的特殊数据结构
        if (content.workflowResult && content.workflowResult.parsedData) {
            console.log('tryFormatAsEnhancedTable: 发现Excel工作流数据结构');
            const parsedData = content.workflowResult.parsedData;
            
            // 检查是否有down_url数组（Excel匹配结果）
            if (parsedData.down_url && Array.isArray(parsedData.down_url)) {
                console.log(`tryFormatAsEnhancedTable: 发现Excel匹配数据，包含${parsedData.down_url.length}条记录`);
                // 对于Excel数据，使用专门的Excel材料表格格式化函数
                return formatExcelMaterialTable(parsedData.down_url);
            }
            
            // 检查其他可能的数据字段
            if (parsedData.output && Array.isArray(parsedData.output)) {
                console.log('tryFormatAsEnhancedTable: 发现parsedData.output数组');
                return formatEnhancedMaterialTable(parsedData.output);
            }
            
            // 递归处理parsedData
            return tryFormatAsEnhancedTable(parsedData);
        }
        
        // 检查是否有新的嵌套output格式
        if (content.output && Array.isArray(content.output)) {
            console.log('tryFormatAsEnhancedTable: 发现新的嵌套output格式');
            
            // 收集所有非空的outputList数据
            const allMaterials = [];
            content.output.forEach((item, index) => {
                if (item.outputList && Array.isArray(item.outputList) && item.outputList.length > 0) {
                    console.log(`tryFormatAsEnhancedTable: 发现第${index}个输出项包含${item.outputList.length}条数据`);
                    allMaterials.push(...item.outputList);
                }
            });
            
            if (allMaterials.length > 0) {
                console.log(`tryFormatAsEnhancedTable: 总共收集到${allMaterials.length}条物料数据`);
                return formatEnhancedMaterialTable(allMaterials);
            }
        }
        // 检查是否有旧的直接output字段
        else if (content.output) {
            return tryFormatAsEnhancedTable(content.output);
        }
        
        // 检查是否有down_url数组（直接的Excel匹配结果）
        if (content.down_url && Array.isArray(content.down_url)) {
            console.log(`tryFormatAsEnhancedTable: 发现直接的Excel匹配数据，包含${content.down_url.length}条记录`);
            // 对于Excel数据，使用专门的Excel材料表格格式化函数
            return formatExcelMaterialTable(content.down_url);
        }
        
        // 检查是否有content字段
        if (content.content) {
            return tryFormatAsEnhancedTable(content.content);
        }
        
        // 检查是否有result字段
        if (content.result) {
            return tryFormatAsEnhancedTable(content.result);
        }
        
        // 如果是数组，直接尝试格式化
        if (Array.isArray(content)) {
            console.log('tryFormatAsEnhancedTable: 发现数组数据，尝试格式化为表格');
            return formatEnhancedMaterialTable(content);
        }
        
        return null;
    }
    
    // 如果是字符串，尝试解析
    if (typeof content === 'string') {
        console.log('tryFormatAsEnhancedTable: 处理字符串内容');
        
        // 检查是否包含物料相关的中文冒号格式
        const hasChineseColonFormat = content.includes('：{') || content.includes('： {');
        const hasEnglishColonFormat = content.includes(': {') || content.includes(':{');
        
        console.log('tryFormatAsEnhancedTable: 中文冒号格式:', hasChineseColonFormat);
        console.log('tryFormatAsEnhancedTable: 英文冒号格式:', hasEnglishColonFormat);
        
        if (!hasChineseColonFormat && !hasEnglishColonFormat) {
            console.log('tryFormatAsEnhancedTable: 未发现物料数据格式');
            return null;
        }
        
        // 分割内容为行
        const lines = content.split(/\r?\n/);
        console.log('tryFormatAsEnhancedTable: 分割后行数:', lines.length);
        
        const objects = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 跳过空行
            if (!line) continue;
            
            // 检查是否包含物料对象格式
            if ((line.includes('：{') || line.includes('： {') || line.includes(': {') || line.includes(':{'))) {
                console.log('tryFormatAsEnhancedTable: 尝试解析对象:', line.substring(0, 100));
                
                try {
                    // 提取JSON部分
                    let jsonStart = line.indexOf('{');
                    if (jsonStart === -1) continue;
                    
                    let jsonStr = line.substring(jsonStart);
                    
                    // 尝试解析JSON
                    let obj = JSON.parse(jsonStr);
                    console.log('tryFormatAsEnhancedTable: 解析成功:', obj);
                    objects.push(obj);
                } catch (e) {
                    console.log('tryFormatAsEnhancedTable: JSON解析失败，尝试修复:', e.message);
                    
                    // 尝试修复常见的JSON格式问题
                    try {
                        let jsonStart = line.indexOf('{');
                        let jsonStr = line.substring(jsonStart);
                        
                        // 修复常见问题
                        jsonStr = jsonStr.replace(/'/g, '"'); // 单引号改双引号
                        jsonStr = jsonStr.replace(/(\w+):/g, '"$1":'); // 属性名加引号
                        jsonStr = jsonStr.replace(/,\s*}/g, '}'); // 移除末尾逗号
                        
                        let obj = JSON.parse(jsonStr);
                        console.log('tryFormatAsEnhancedTable: 修复后解析成功:', obj);
                        objects.push(obj);
                    } catch (e2) {
                        console.log('tryFormatAsEnhancedTable: 修复后仍解析失败:', e2.message);
                    }
                }
            }
        }
        
        console.log('tryFormatAsEnhancedTable: 解析到的对象数量:', objects.length);
        
        if (objects.length > 0) {
            console.log('tryFormatAsEnhancedTable: 调用formatEnhancedMaterialTable');
            return formatEnhancedMaterialTable(objects);
        }
        
        // 尝试直接解析整个内容为JSON
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                console.log('tryFormatAsEnhancedTable: 直接解析为数组成功');
                return formatEnhancedMaterialTable(parsed);
            } else if (parsed && typeof parsed === 'object') {
                console.log('tryFormatAsEnhancedTable: 直接解析为对象成功');
                return formatEnhancedMaterialTable([parsed]);
            }
        } catch (e) {
            console.log('tryFormatAsEnhancedTable: 直接解析失败:', e.message);
        }
    }
    
    console.log('tryFormatAsEnhancedTable: 无法格式化为表格');
    return null;
}

// 增强版表格格式化函数，专门用于详细查看模态框
function formatEnhancedMaterialTable(materials) {
    if (!Array.isArray(materials) || materials.length === 0) {
        return null;
    }
    
    // 定义表头映射 - 包含所有字段
    const columnMapping = [
        { header: 'UID', field: 'uid', isUid: true },
        { header: '物料名称', field: 'medicine_name' },
        { header: '规格', field: 'specification' },
        { header: '生产厂家', field: 'manufacturers' },
        { header: '供应商', field: 'vendor' },
        { header: '采购员', field: 'goods_buyer' },
        { header: '批准文号', field: 'approval_number' },
        { header: '国际条形码', field: 'international_code' },
        { header: '商品名', field: 'commonly_name' },
        { header: '药剂类型', field: 'medicine_type' },
        { header: '剂型描述', field: 'dosage_description' },
        { header: '标签名称', field: 'label_name' },
        { header: '库存位置', field: 'inventory_location' },
        { header: '库存数量', field: 'inventory_quantity' },
        { header: '生产日期', field: 'manufacture_date' },
        { header: '有效期', field: 'expiration_date' }
    ];
    
    // 创建HTML表格容器
    let tableHTML = '<div class="enhanced-material-table-container">\n';
    
    // 添加UID复制功能区域
    tableHTML += '<div class="uid-copy-controls">\n';
    tableHTML += '<h4>UID 复制功能</h4>\n';
    tableHTML += '<div class="uid-copy-buttons">\n';
    tableHTML += '<button class="btn btn-secondary" onclick="selectAllUids()">全选UID</button>\n';
    tableHTML += '<button class="btn btn-secondary" onclick="clearUidSelection()">清除选择</button>\n';
    tableHTML += '<button class="btn btn-primary" onclick="copySelectedUids()">复制选中的UID</button>\n';
    tableHTML += '</div>\n';
    tableHTML += '<div class="uid-copy-instructions">\n';
    tableHTML += '<p><strong>使用说明：</strong></p>\n';
    tableHTML += '<ul>\n';
    tableHTML += '<li>点击UID单元格可选择/取消选择</li>\n';
    tableHTML += '<li>按住Ctrl键点击可进行多选</li>\n';
    tableHTML += '<li>选中的UID会高亮显示</li>\n';
    tableHTML += '<li><strong>快捷键：Ctrl+C 复制选中的UID</strong></li>\n';
    tableHTML += '</ul>\n';
    tableHTML += '</div>\n';
    tableHTML += '</div>\n';
    
    // 创建表格
    tableHTML += '<table class="enhanced-material-table">\n';
    
    // 创建表头
    tableHTML += '<thead>\n<tr>\n';
    columnMapping.forEach(col => {
        const className = col.isUid ? 'uid-header' : '';
        tableHTML += `<th class="${className}">${col.header}</th>\n`;
    });
    tableHTML += '</tr>\n</thead>\n';
    
    // 创建表体
    tableHTML += '<tbody>\n';
    materials.forEach((material, index) => {
        tableHTML += '<tr>\n';
        columnMapping.forEach(col => {
            const value = material[col.field] || '';
            if (col.isUid) {
                tableHTML += `<td class="uid-cell" data-uid="${value}" onclick="toggleUidSelection(this, event)">${value}</td>\n`;
            } else {
                tableHTML += `<td>${value}</td>\n`;
            }
        });
        tableHTML += '</tr>\n';
    });
    tableHTML += '</tbody>\n';
    
    tableHTML += '</table>\n</div>';
    
    return tableHTML;
}

// UID选择相关的全局变量
let selectedUids = new Set();

// 切换UID选择状态
function toggleUidSelection(cell, event) {
    const uid = cell.getAttribute('data-uid');
    
    // 如果没有按Ctrl键，清除之前的选择（除非点击的是已选中的项）
    if (!event.ctrlKey && !selectedUids.has(uid)) {
        clearUidSelection();
    }
    
    // 切换当前UID的选择状态
    if (selectedUids.has(uid)) {
        selectedUids.delete(uid);
        cell.classList.remove('selected');
    } else {
        selectedUids.add(uid);
        cell.classList.add('selected');
    }
    
    updateUidCopyButtonState();
}

// 全选UID
function selectAllUids() {
    selectedUids.clear();
    const uidCells = document.querySelectorAll('.uid-cell');
    uidCells.forEach(cell => {
        const uid = cell.getAttribute('data-uid');
        selectedUids.add(uid);
        cell.classList.add('selected');
    });
    updateUidCopyButtonState();
}

// 清除UID选择
function clearUidSelection() {
    selectedUids.clear();
    const uidCells = document.querySelectorAll('.uid-cell');
    uidCells.forEach(cell => {
        cell.classList.remove('selected');
    });
    updateUidCopyButtonState();
}

// 复制选中的UID
function copySelectedUids() {
    if (selectedUids.size === 0) {
        showNotification('请先选择要复制的UID', 'warning');
        return;
    }
    
    const uidsArray = Array.from(selectedUids);
    const uidsText = uidsArray.join('\n');
    
    navigator.clipboard.writeText(uidsText).then(() => {
        showNotification(`已复制 ${selectedUids.size} 个UID到剪贴板`, 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败，请重试', 'error');
    });
}

// 更新UID复制按钮状态
function updateUidCopyButtonState() {
    const copyButton = document.querySelector('.uid-copy-buttons .btn-primary');
    if (copyButton) {
        if (selectedUids.size > 0) {
            copyButton.textContent = `复制选中的UID (${selectedUids.size})`;
            copyButton.disabled = false;
        } else {
            copyButton.textContent = '复制选中的UID';
            copyButton.disabled = true;
        }
    }
}

// 模拟工作流API调用（用于工作流B）
async function simulateWorkflowAPI(type, inputText) {
    // 如果是工作流A，使用真实API
    if (type === 'a') {
        return await callCozeWorkflowAPI(type, inputText);
    }
    
    // 工作流B仍使用模拟
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    return `工作流B处理结果：\n\n输入内容：${inputText}\n\n处理时间：${new Date().toLocaleString()}\n状态：处理成功\n\n这是工作流B的模拟输出结果。实际使用时，这里将显示扣子工作流API的真实响应内容。`;
}

// 模拟文件处理API调用
async function simulateFileProcessingAPI(fileName, content) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
    
    // 模拟文件处理结果
    return `文件处理结果：\n\n文件名：${fileName}\n文件大小：${formatFileSize(content.length)}\n处理时间：${new Date().toLocaleString()}\n状态：处理成功\n\n文件内容预览：\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\n这是文件处理的模拟输出结果。实际使用时，这里将显示扣子工作流API的真实响应内容和下载链接。`;
}

// 显示处理结果
function displayResult(resultId, content, fullData = null) {
    console.log('🔄 displayResult v3.0 - 通用数据处理');
    console.log('📺 displayResult called with:', { resultId, content, fullData });
    
    const resultArea = document.getElementById(resultId);
    console.log('📺 结果区域元素:', { resultArea, exists: !!resultArea });
    
    if (!resultArea) {
        console.error('❌ 找不到结果区域元素:', resultId);
        return;
    }
    
    const resultContent = resultArea.querySelector('.result-content');
    console.log('📺 结果内容元素:', { resultContent, exists: !!resultContent });
    
    // 通用数据处理：检查各种数据源
    console.log('📺 数据处理检查:', { 
        resultId, 
        hasFullData: !!fullData,
        fullDataType: typeof fullData,
        fullDataKeys: fullData ? Object.keys(fullData) : null,
        contentType: typeof content,
        contentKeys: (typeof content === 'object' && content) ? Object.keys(content) : null
    });
    
    let processedResult = null;
    
    // 1. 检查是否有已解析的对象数据（优先处理）
    if (fullData && fullData.workflowResult && fullData.workflowResult.parsedData) {
        const workflowData = fullData.workflowResult.parsedData;
        console.log('🔍 检查workflowResult.parsedData:', typeof workflowData);
        console.log('🔍 workflowData内容:', workflowData);
        
        // 如果是对象且包含down_url数组，直接处理
        if (typeof workflowData === 'object' && workflowData.down_url && Array.isArray(workflowData.down_url)) {
            console.log('🎯 检测到已解析的药品匹配数据，包含', workflowData.down_url.length, '条记录');
            processedResult = formatExcelMaterialTable(workflowData.down_url);
        }
        // 如果是字符串，尝试解析
        else if (typeof workflowData === 'string') {
            console.log('🔍 workflowResult.data是字符串，长度:', workflowData.length);
            console.log('🔍 字符串预览:', workflowData.substring(0, 100) + '...');
            console.log('🔍 调用processStringData函数');
            processedResult = processStringData(workflowData, resultId);
            console.log('🔍 processStringData返回结果:', processedResult ? '有结果' : '无结果');
            if (processedResult) {
                console.log('🔍 返回结果长度:', processedResult.length);
                console.log('🔍 返回结果预览:', processedResult.substring(0, 200) + '...');
            }
        }
        // 如果workflowData本身就是解析后的对象（从日志看是这种情况）
        else {
            console.log('🔍 workflowData类型未知，尝试直接处理');
            console.log('🔍 workflowData keys:', Object.keys(workflowData || {}));
            if (workflowData && workflowData.down_url && Array.isArray(workflowData.down_url)) {
                console.log('🎯 在workflowData中检测到药品匹配数据，包含', workflowData.down_url.length, '条记录');
                processedResult = formatExcelMaterialTable(workflowData.down_url);
            }
        }
    }
    
    // 2. 检查content是否包含可处理的数据
    if (!processedResult && content) {
        console.log('🔍 检查content数据:', typeof content, content);
        
        // 如果content是对象且包含down_url数组
        if (typeof content === 'object' && content.down_url && Array.isArray(content.down_url)) {
            console.log('🎯 content中检测到药品匹配数据，包含', content.down_url.length, '条记录');
            processedResult = formatExcelMaterialTable(content.down_url);
        }
        // 如果content是字符串
        else if (typeof content === 'string') {
            console.log('🔍 content是字符串，尝试智能处理');
            processedResult = processStringData(content, resultId);
        }
        // 如果content是其他类型的对象，尝试通用处理
        else if (typeof content === 'object') {
            console.log('🔍 content是对象，尝试通用对象处理');
            processedResult = formatObjectAsTable(content);
        }
    }
    
    // 如果成功处理了数据，显示结果
    if (processedResult) {
        console.log('✅ 数据处理成功，显示结果');
        resultContent.innerHTML = processedResult;
        resultArea.style.display = 'block';
        
        // 存储数据
        let type = resultId.replace('-result', '');
        fullResponseData[type] = fullData || content;
        if (typeof content === 'string') {
            fullResponseData[type].originalContent = content;
        }
        
        // 滚动到结果区域
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
    }
    
    // 检测内容是否已经是HTML格式
    if (content && typeof content === 'string' && content.includes('<table') && content.includes('</table>')) {
        console.log('displayResult: 检测到HTML表格，直接显示');
        resultContent.innerHTML = content;
    } else {
        // 尝试格式化为表格
        const tableResult = tryFormatAsTable(content);
        if (tableResult) {
            console.log('displayResult: 使用表格格式显示');
            console.log('displayResult: 表格HTML长度:', tableResult.length);
            console.log('displayResult: 表格HTML预览:', tableResult.substring(0, 200) + '...');
            
            resultContent.innerHTML = tableResult;
            
            // 验证HTML是否正确插入
            console.log('displayResult: 插入后的HTML长度:', resultContent.innerHTML.length);
            console.log('displayResult: 插入后的HTML预览:', resultContent.innerHTML.substring(0, 200) + '...');
            
            // 检查表格元素是否存在
            const tableElement = resultContent.querySelector('table');
            console.log('displayResult: 表格元素是否存在:', !!tableElement);
            if (tableElement) {
                console.log('displayResult: 表格行数:', tableElement.querySelectorAll('tr').length);
            }
        } else {
            console.log('displayResult: 使用原始文本显示');
            resultContent.textContent = content;
        }
    }
    
    resultArea.style.display = 'block';
    
    // 存储完整的响应数据和原始内容
    // 修复类型映射，确保每个工作流使用独立的数据存储
    let type;
    if (resultId === 'pricing-result') {
        type = 'pricing'; // 独立报价页面使用pricing键
    } else if (resultId === 'material-result') {
        type = 'material'; // 独立物料查询页面使用material键
    } else if (resultId === 'excel-result') {
        type = 'excel'; // Excel工作流使用excel键
    } else {
        type = resultId.replace('result-', '');
    }
    
    if (fullData) {
        console.log('displayResult: Storing data for type:', type, 'data:', fullData);
        fullResponseData[type] = fullData;
        console.log('displayResult: fullResponseData after storage:', fullResponseData);
        
        // 如果fullData包含parsedData，优先使用原始数据作为originalContent
        if (fullData.parsedData && fullData.parsedData.output) {
            if (typeof fullData.parsedData.output === 'string') {
                fullResponseData[type].originalContent = fullData.parsedData.output;
            } else if (Array.isArray(fullData.parsedData.output)) {
                // 处理新的嵌套output格式
                console.log('displayResult: 检测到新的嵌套output格式');
                
                // 收集所有非空的outputList数据
                const allMaterials = [];
                fullData.parsedData.output.forEach((item, index) => {
                    if (item.outputList && Array.isArray(item.outputList) && item.outputList.length > 0) {
                        console.log(`displayResult: 发现第${index}个输出项包含${item.outputList.length}条数据`);
                        allMaterials.push(...item.outputList);
                    }
                });
                
                if (allMaterials.length > 0) {
                    console.log(`displayResult: 总共收集到${allMaterials.length}条物料数据`);
                    // 存储收集到的物料数据
                    fullResponseData[type].originalContent = JSON.stringify(allMaterials, null, 2);
                    // 同时存储完整的原始数据结构
                    fullResponseData[type].rawOutput = fullData.parsedData.output;
                } else {
                    // 如果没有找到物料数据，存储完整的output结构
                    fullResponseData[type].originalContent = JSON.stringify(fullData.parsedData.output, null, 2);
                }
            } else if (typeof fullData.parsedData.output === 'object') {
                // 如果是对象，尝试获取第一个字符串值作为原始内容
                const entries = Object.entries(fullData.parsedData.output);
                if (entries.length === 1 && typeof entries[0][1] === 'string') {
                    fullResponseData[type].originalContent = entries[0][1];
                } else {
                    // 如果是复杂对象，使用JSON字符串
                    fullResponseData[type].originalContent = JSON.stringify(fullData.parsedData.output, null, 2);
                }
            }
        } else if (fullData.parsedData && fullData.parsedData.content) {
            fullResponseData[type].originalContent = fullData.parsedData.content;
        } else if (fullData.parsedData && fullData.parsedData.result) {
            fullResponseData[type].originalContent = fullData.parsedData.result;
        } else {
            // 回退到格式化后的内容
            fullResponseData[type].originalContent = content;
        }
    } else {
        console.log('displayResult: No fullData provided');
        // 如果没有fullData，初始化存储结构并使用content作为原始内容
        if (!fullResponseData[type]) {
            fullResponseData[type] = {};
        }
        fullResponseData[type].originalContent = content;
    }
    console.log('displayResult: Stored original content for type:', type, 'content:', fullResponseData[type].originalContent);
    
    // 确保滚动条正确显示
    setTimeout(() => {
        // 强制重新计算滚动条
        const originalOverflowY = resultContent.style.overflowY;
        resultContent.style.overflowY = 'hidden';
        resultContent.offsetHeight; // 触发重排
        resultContent.style.overflowY = originalOverflowY || 'auto';
        
        // 检查内容是否超出容器高度
        const contentHeight = resultContent.scrollHeight;
        const containerHeight = resultContent.clientHeight;
        
        console.log('Content height:', contentHeight, 'Container height:', containerHeight);
        
        // 如果内容超出容器，确保滚动条可见
        if (contentHeight > containerHeight) {
            resultContent.style.overflowY = 'auto';
            console.log('Scrollbar should be visible');
        }
        
        // 重新初始化滚动功能
        checkScrollbarVisibility(resultContent);
    }, 100);
    
    // 滚动到结果区域
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 复制结果
function copyResult(type) {
    // 检查是否在独立页面
    const isInPricingPage = document.getElementById('pricing-workflow-page').style.display !== 'none';
    const isInMaterialPage = document.getElementById('material-workflow-page').style.display !== 'none';
    
    let resultContent;
    if (isInPricingPage && (type === 'pricing' || type === 'a')) {
        // 在独立报价页面中，使用pricing-result
        resultContent = document.querySelector('#pricing-result .result-content');
    } else if (isInMaterialPage && (type === 'material' || type === 'b')) {
        // 在独立物料查询页面中，使用material-result
        resultContent = document.querySelector('#material-result .result-content');
    } else {
        // 在原始界面中，使用result-{type}
        const resultId = `result-${type}`;
        resultContent = document.querySelector(`#${resultId} .result-content`);
    }
    
    if (!resultContent || !resultContent.textContent.trim()) {
        showNotification('没有可复制的内容', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(resultContent.textContent).then(() => {
        showNotification('内容已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动选择复制', 'error');
    });
}

// 下载结果
function downloadResult(type) {
    // 检查是否在独立页面
    const isInPricingPage = document.getElementById('pricing-workflow-page').style.display !== 'none';
    const isInMaterialPage = document.getElementById('material-workflow-page').style.display !== 'none';
    
    let resultContent;
    if (isInPricingPage && (type === 'pricing' || type === 'a')) {
        // 在独立报价页面中，使用pricing-result
        resultContent = document.querySelector('#pricing-result .result-content');
    } else if (isInMaterialPage && (type === 'material' || type === 'b')) {
        // 在独立物料查询页面中，使用material-result
        resultContent = document.querySelector('#material-result .result-content');
    } else {
        // 在原始界面中，使用result-{type}
        const resultId = `result-${type}`;
        resultContent = document.querySelector(`#${resultId} .result-content`);
    }
    
    if (!resultContent || !resultContent.textContent.trim()) {
        showNotification('没有可下载的内容', 'warning');
        return;
    }
    
    const content = resultContent.textContent;
    const fileName = `workflow_${type}_result_${new Date().getTime()}.txt`;
    
    downloadTextFile(content, fileName);
    showNotification('文件下载已开始', 'success');
}

// 下载处理后的文件
function downloadProcessedFile() {
    const resultContent = document.querySelector('#result-file .result-content');
    
    if (!resultContent || !resultContent.textContent.trim()) {
        showNotification('没有可下载的内容', 'warning');
        return;
    }
    
    const content = resultContent.textContent;
    const fileName = `processed_file_${new Date().getTime()}.txt`;
    
    downloadTextFile(content, fileName);
    showNotification('处理结果下载已开始', 'success');
}

// 下载文本文件
function downloadTextFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 下载Excel文件
function downloadExcelFile(data, fileName) {
    try {
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 如果数据是数组格式（表格数据）
        if (Array.isArray(data) && data.length > 0) {
            // 定义与详细查看表格相同的列顺序
            const preferredColumnOrder = [
                '编码', '物料名称', '规格', '生产厂家', '批准文号', '条形码',
                'uid', 'medicine_name', 'specifications', 'manufacturer',
                'assessment_price', 'quote_price', 'collective_price', 'specific_price',
                'negotiated_price', 'last_sale_price', 'last_sale_date', 'giveaway_strategy',
                'market_quantity', 'prohibited_selling', 'manufacture_date', 'expiration_date',
                'product_arrival_date', 'unstocked_quantity', 'approval_number', 'international_code',
                'buyer', 'match_type'
            ];
            
            // 获取数据中实际存在的所有列
            const allColumns = new Set();
            data.forEach(row => {
                Object.keys(row).forEach(key => allColumns.add(key));
            });
            
            // 按照优先顺序排列列，然后添加剩余的列
            const orderedColumns = [];
            const usedColumns = new Set();
            
            // 先添加优先级列（如果存在）
            preferredColumnOrder.forEach(col => {
                if (allColumns.has(col) && !usedColumns.has(col)) {
                    orderedColumns.push(col);
                    usedColumns.add(col);
                }
            });
            
            // 再添加剩余的列
            Array.from(allColumns).forEach(col => {
                if (!usedColumns.has(col)) {
                    orderedColumns.push(col);
                }
            });
            
            console.log('downloadExcelFile: 使用的列顺序:', orderedColumns);
            
            // 定义英文字段名到中文显示名的映射
            const fieldToDisplayMapping = {
                // 客户信息
                '编码': '客户编码',
                '物料名称': '客户物料名称',
                '规格': '客户规格',
                '生产厂家': '生产厂家',
                '批准文号': '批准文号',
                '条形码': '条形码',
                
                // 系统信息
                'uid': '系统ID',
                'medicine_name': '系统物料名称',
                'specifications': '系统规格',
                'manufacturer': '生产厂家',
                
                // 价格信息
                'assessment_price': '考核价',
                'quote_price': '报价',
                'collective_price': '集合考核价',
                'specific_price': '特定价',
                'negotiated_price': '协议价',
                'last_sale_price': '上次销价',
                'last_sale_date': '上次销售日期',
                
                // 库存和销售信息
                'giveaway_strategy': '赠品策略',
                'market_quantity': '可销库存',
                'prohibited_selling': '是否禁销',
                
                // 日期信息
                'manufacture_date': '生产日期',
                'expiration_date': '有效期',
                'product_arrival_date': '预计到货日期',
                'unstocked_quantity': '未入库数量',
                
                // 系统标识信息
                'approval_number': '系统批准文号',
                'international_code': '条码',
                
                // 其他信息
                'buyer': '采购员',
                'match_type': '匹配类型'
            };
            
            // 将英文字段名转换为中文显示名
            const chineseHeaders = orderedColumns.map(col => fieldToDisplayMapping[col] || col);
            console.log('downloadExcelFile: 中文列名:', chineseHeaders);
            
            // 使用指定的列顺序创建工作表，并设置中文列名
            const ws = XLSX.utils.json_to_sheet(data, { header: orderedColumns });
            
            // 替换表头为中文名称
            chineseHeaders.forEach((chineseName, index) => {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
                if (ws[cellAddress]) {
                    ws[cellAddress].v = chineseName;
                }
            });
            
            // 设置字体样式
            const defaultStyle = {
                font: {
                    name: "微软雅黑",
                    sz: 11,
                    color: { rgb: "000000" }
                },
                alignment: {
                    vertical: "center",
                    horizontal: "left",
                    wrapText: true
                },
                border: {
                    top: { style: "thin", color: { rgb: "D0D0D0" } },
                    bottom: { style: "thin", color: { rgb: "D0D0D0" } },
                    left: { style: "thin", color: { rgb: "D0D0D0" } },
                    right: { style: "thin", color: { rgb: "D0D0D0" } }
                }
            };

            // 表头样式
            const headerStyle = {
                font: {
                    name: "微软雅黑",
                    sz: 12,
                    bold: true,
                    color: { rgb: "FFFFFF" }
                },
                fill: {
                    fgColor: { rgb: "4472C4" }
                },
                alignment: {
                    vertical: "center",
                    horizontal: "center",
                    wrapText: true
                },
                border: {
                    top: { style: "thin", color: { rgb: "FFFFFF" } },
                    bottom: { style: "thin", color: { rgb: "FFFFFF" } },
                    left: { style: "thin", color: { rgb: "FFFFFF" } },
                    right: { style: "thin", color: { rgb: "FFFFFF" } }
                }
            };

            // 智能列宽设置
            const getColumnWidth = (fieldName, data) => {
                // 根据字段类型设置不同的列宽
                const fieldWidthMap = {
                    'uid': 12,
                    'medicine_name': 25,
                    'specifications': 20,
                    'assessment_price': 15,
                    'quote_price': 15,
                    'profit_margin': 12,
                    'profit_amount': 15,
                    'customer_code': 15,
                    'customer_material_name': 25,
                    'customer_specifications': 20,
                    'unit': 8,
                    'quantity': 10,
                    'total_amount': 15,
                    'delivery_date': 12,
                    'remarks': 30,
                    'supplier_name': 20,
                    'supplier_code': 15,
                    'supplier_material_name': 25,
                    'supplier_specifications': 20,
                    'supplier_price': 15,
                    'supplier_delivery_date': 12,
                    'supplier_remarks': 25,
                    'match_status': 12,
                    'match_score': 10,
                    'price_difference': 15,
                    'price_difference_percentage': 18,
                    'recommendation': 15,
                    'created_at': 18,
                    'updated_at': 18
                };

                // 如果有预设宽度，使用预设值
                if (fieldWidthMap[fieldName]) {
                    return fieldWidthMap[fieldName];
                }

                // 否则根据内容动态计算
                const maxLength = Math.max(
                    fieldName.length,
                    ...data.map(row => String(row[fieldName] || '').length)
                );
                return Math.min(Math.max(maxLength + 2, 10), 35);
            };

            // 设置列宽
            const colWidths = [];
            orderedColumns.forEach((key, index) => {
                colWidths[index] = { wch: getColumnWidth(key, data) };
            });
            ws['!cols'] = colWidths;

            // 应用样式到所有单元格
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[cellAddress]) continue;
                    
                    // 表头样式
                    if (R === 0) {
                        ws[cellAddress].s = headerStyle;
                    } else {
                        // 数据行样式
                        ws[cellAddress].s = defaultStyle;
                        
                        // 数字列右对齐
                        const fieldName = orderedColumns[C];
                        if (['assessment_price', 'quote_price', 'profit_margin', 'profit_amount', 
                             'quantity', 'total_amount', 'supplier_price', 'match_score', 
                             'price_difference', 'price_difference_percentage'].includes(fieldName)) {
                            ws[cellAddress].s.alignment.horizontal = "right";
                        }
                    }
                }
            }
            
            // 添加工作表到工作簿
            XLSX.utils.book_append_sheet(wb, ws, "详细结果");
        } else {
            // 如果不是表格数据，创建一个简单的文本工作表
            const ws = XLSX.utils.aoa_to_sheet([["内容"], [String(data)]]);
            ws['!cols'] = [{ wch: 50 }];
            XLSX.utils.book_append_sheet(wb, ws, "详细结果");
        }
        
        // 生成Excel文件并下载
        XLSX.writeFile(wb, fileName);
        
    } catch (error) {
        console.error('Excel文件生成失败:', error);
        // 如果Excel生成失败，回退到文本下载
        const txtFileName = fileName.replace('.xlsx', '.txt');
        downloadTextFile(typeof data === 'string' ? data : JSON.stringify(data, null, 2), txtFileName);
        throw error;
    }
}

// 批量下载所有结果（使用JSZip）
async function downloadAllResults() {
    const zip = new JSZip();
    let hasContent = false;
    const timestamp = new Date().getTime();
    
    // 收集工作流A的结果
    const resultA = document.querySelector('#result-a .result-content');
    if (resultA && resultA.textContent.trim()) {
        zip.file(`workflow_a_result_${timestamp}.txt`, resultA.textContent);
        hasContent = true;
    }
    
    // 收集工作流B的结果
    const resultB = document.querySelector('#result-b .result-content');
    if (resultB && resultB.textContent.trim()) {
        zip.file(`workflow_b_result_${timestamp}.txt`, resultB.textContent);
        hasContent = true;
    }
    
    // 收集文件处理的结果
    const fileResult = document.querySelector('#file-result .result-content');
    if (fileResult && fileResult.textContent.trim()) {
        zip.file(`file_processing_result_${timestamp}.txt`, fileResult.textContent);
        hasContent = true;
    }
    
    if (!hasContent) {
        showNotification('没有可下载的内容', 'warning');
        return;
    }
    
    try {
        showNotification('正在生成压缩包...', 'info');
        const content = await zip.generateAsync({ type: 'blob' });
        
        // 下载压缩包
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `噼里啪啦小助手_批量结果_${timestamp}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('批量下载完成！', 'success');
    } catch (error) {
        console.error('批量下载失败:', error);
        showNotification('批量下载失败，请重试', 'error');
    }
}

// 显示/隐藏加载动画
function showLoading(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        maxWidth: '300px',
        wordWrap: 'break-word',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // 设置背景颜色
    const colors = {
        success: '#00ff88',
        error: '#ff4757',
        warning: '#ffaa00',
        info: '#00d4ff'
    };
    notification.style.background = colors[type] || colors.info;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动移除
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 工具函数：节流
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
    showNotification('发生了一个错误，请刷新页面重试', 'error');
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise拒绝:', e.reason);
    showNotification('操作失败，请稍后重试', 'error');
});

// 导出函数供HTML调用



// 存储当前显示的结果数据
let currentModalData = {
    type: '',
    content: '',
    formattedContent: ''
};

// 独立的数据管理系统 - 每个工作流使用独立的数据存储空间
let workflowDataManager = {
    // 报价工作流数据
    pricing: {
        fullData: null,
        originalContent: null,
        lastUpdated: null
    },
    // 物料查询工作流数据
    material: {
        fullData: null,
        originalContent: null,
        lastUpdated: null
    },
    // Excel工作流数据
    excel: {
        fullData: null,
        originalContent: null,
        lastUpdated: null
    },
    // 原始工作流数据（向后兼容）
    a: null,
    b: null,
    file: null
};

// 向后兼容的数据访问器
let fullResponseData = new Proxy(workflowDataManager, {
    get(target, prop) {
        if (prop in target) {
            // 如果是新的结构化数据，返回完整对象
            if (typeof target[prop] === 'object' && target[prop] !== null && 'fullData' in target[prop]) {
                return target[prop].fullData;
            }
            return target[prop];
        }
        return undefined;
    },
    set(target, prop, value) {
        if (['pricing', 'material', 'excel'].includes(prop)) {
            // 新的结构化存储
            if (typeof target[prop] !== 'object' || target[prop] === null) {
                target[prop] = { fullData: null, originalContent: null, lastUpdated: null };
            }
            target[prop].fullData = value;
            target[prop].lastUpdated = new Date().toISOString();
        } else {
            // 向后兼容的直接存储
            target[prop] = value;
        }
        return true;
    }
});

// 查看详细结果
function viewDetailedResult(type) {
    console.log('viewDetailedResult called with type:', type);
    console.log('fullResponseData:', fullResponseData);
    
    // 检查是否在独立页面
    const isInPricingPage = document.getElementById('pricing-workflow-page').style.display !== 'none';
    const isInMaterialPage = document.getElementById('material-workflow-page').style.display !== 'none';
    const isInExcelPage = document.getElementById('excel-workflow-page').style.display !== 'none';
    
    let resultElement;
    let dataKey = type; // 默认使用type作为数据键
    
    if (isInPricingPage && (type === 'pricing' || type === 'a')) {
        // 在独立报价页面中，使用pricing-result
        resultElement = document.querySelector('#pricing-result .result-content');
        dataKey = 'pricing'; // 使用pricing键，与displayResult函数一致
    } else if (isInMaterialPage && (type === 'material' || type === 'b')) {
        // 在独立物料查询页面中，使用material-result
        resultElement = document.querySelector('#material-result .result-content');
        dataKey = 'material'; // 使用material键，与displayResult函数一致
    } else if (isInExcelPage && (type === 'excel' || type === 'c')) {
        // 在独立Excel页面中，使用excel-result
        resultElement = document.querySelector('#excel-result .result-content');
        dataKey = 'excel'; // 使用excel键，与displayResult函数一致
    } else {
        // 在原始界面中，使用result-{type}
        resultElement = document.querySelector(`#result-${type} .result-content`);
    }
    
    const fullData = fullResponseData[dataKey];
    let rawContent = '';
    
    // 添加调试信息
    console.log('viewDetailedResult: dataKey =', dataKey);
    console.log('viewDetailedResult: fullData =', fullData);
    if (fullData) {
        console.log('viewDetailedResult: fullData keys =', Object.keys(fullData));
        console.log('viewDetailedResult: fullData.originalContent =', fullData.originalContent);
        console.log('viewDetailedResult: fullData.workflowResult =', fullData.workflowResult);
        if (fullData.workflowResult && fullData.workflowResult.parsedData) {
            console.log('viewDetailedResult: parsedData =', fullData.workflowResult.parsedData);
            console.log('viewDetailedResult: parsedData keys =', Object.keys(fullData.workflowResult.parsedData));
        }
    }
    
    if (fullData && fullData.originalContent) {
        rawContent = fullData.originalContent;
    } else if (resultElement && resultElement.textContent.trim()) {
        rawContent = resultElement.textContent;
    } else {
        showNotification('暂无结果数据可查看', 'warning');
        return;
    }
    
    // 尝试检测并格式化为增强表格
    let enhancedTableContent = null;
    
    // 特殊处理Excel详细查看功能
    if ((type === 'c' || type === 'excel') && fullData && fullData.workflowResult && fullData.workflowResult.parsedData && fullData.workflowResult.parsedData.down_url && Array.isArray(fullData.workflowResult.parsedData.down_url)) {
        console.log('viewDetailedResult: 为Excel详细查看使用专门的格式化函数');
        
        const downUrlArray = fullData.workflowResult.parsedData.down_url;
        console.log('viewDetailedResult: down_url数组长度:', downUrlArray.length);
        
        if (downUrlArray.length > 0) {
            console.log('viewDetailedResult: down_url数组前3项:', downUrlArray.slice(0, Math.min(3, downUrlArray.length)));
            console.log('viewDetailedResult: down_url第一项类型:', typeof downUrlArray[0]);
            console.log('viewDetailedResult: down_url第一项内容:', downUrlArray[0]);
        } else {
            console.log('viewDetailedResult: down_url数组为空');
        }
        
        try {
            console.log('viewDetailedResult: 开始调用formatExcelTableAsHTML');
            console.log('viewDetailedResult: 开始处理rows数据，数组长度:', downUrlArray.length);
            
            const rows = [];
            for (let i = 0; i < downUrlArray.length; i++) {
                console.log(`viewDetailedResult: 处理第${i+1}行数据:`, downUrlArray[i]);
                try {
                    const parsedRow = parseDetailedExcelRow(downUrlArray[i]);
                    console.log(`viewDetailedResult: 第${i+1}行解析结果:`, parsedRow);
                    // 将对象转换为数组格式，包装在数组中以便formatExcelTableAsHTML处理
                    rows.push([parsedRow]);
                } catch (rowError) {
                    console.error(`viewDetailedResult: 第${i+1}行解析失败:`, rowError);
                    rows.push([{}]); // 添加空对象作为占位符，包装在数组中
                }
            }
            
            const tableData = {
                headers: [
                    '编码', '物料名称', '规格', '生产厂家', '批准文号', '条形码',
                    'uid', 'medicine_name', 'specifications', 'manufacturer',
                    'assessment_price', 'quote_price', 'collective_price', 'specific_price',
                    'negotiated_price', 'last_sale_price', 'last_sale_date', 'giveaway_strategy',
                    'market_quantity', 'prohibited_selling', 'manufacture_date', 'expiration_date',
                    'product_arrival_date', 'unstocked_quantity', 'approval_number', 'international_code',
                    'buyer', 'match_type'
                ],
                rows: rows
            };
            console.log('viewDetailedResult: tableData准备完成，headers数量:', tableData.headers.length);
            console.log('viewDetailedResult: tableData准备完成，rows数量:', tableData.rows.length);
            
            enhancedTableContent = formatExcelTableAsHTML(tableData);
            console.log('viewDetailedResult: Excel表格格式化成功，结果长度:', enhancedTableContent ? enhancedTableContent.length : 'null');
        } catch (error) {
            console.error('viewDetailedResult: Excel表格格式化失败:', error);
            console.error('viewDetailedResult: 错误堆栈:', error.stack);
            enhancedTableContent = null;
        }
    } else if ((type === 'pricing' || type === 'a')) {
        // 特殊处理报价工作流的详细查看功能
        console.log('viewDetailedResult: 为报价工作流详细查看使用专门的格式化函数');
        
        // 尝试从多个数据源获取原始内容
        let pricingRawContent = rawContent;
        
        // 检查fullData中的各种可能的数据位置
        if (fullData) {
            console.log('viewDetailedResult: 检查fullData中的报价数据');
            
            // 检查formattedResult
            if (fullData.formattedResult && typeof fullData.formattedResult === 'string') {
                console.log('viewDetailedResult: 找到formattedResult数据');
                pricingRawContent = fullData.formattedResult;
            }
            // 检查parsedData.output
            else if (fullData.parsedData && fullData.parsedData.output) {
                console.log('viewDetailedResult: 找到parsedData.output数据');
                if (typeof fullData.parsedData.output === 'string') {
                    pricingRawContent = fullData.parsedData.output;
                } else {
                    pricingRawContent = JSON.stringify(fullData.parsedData.output, null, 2);
                }
            }
            // 检查originalContent
            else if (fullData.originalContent) {
                console.log('viewDetailedResult: 找到originalContent数据');
                pricingRawContent = fullData.originalContent;
            }
        }
        
        console.log('viewDetailedResult: 使用的报价原始内容长度:', pricingRawContent ? pricingRawContent.length : 0);
        console.log('viewDetailedResult: 报价原始内容预览:', pricingRawContent ? pricingRawContent.substring(0, 200) + '...' : 'null');
        
        // 检查是否是报价工作流的数据格式
        if (pricingRawContent && (pricingRawContent.includes('### ID:') || (pricingRawContent.includes('物料:') && pricingRawContent.includes('规格:') && pricingRawContent.includes('生产厂家:')))) {
            console.log('viewDetailedResult: 检测到报价工作流数据格式，使用formatPricingTable');
            enhancedTableContent = formatPricingTable(pricingRawContent);
            if (enhancedTableContent) {
                console.log('viewDetailedResult: 报价表格格式化成功');
            } else {
                console.log('viewDetailedResult: 报价表格格式化失败，使用常规处理');
            }
        }
        
        // 如果报价格式化失败，尝试常规处理
        if (!enhancedTableContent && pricingRawContent) {
            console.log('viewDetailedResult: 尝试常规表格格式化');
            if (fullData && fullData.parsedData) {
                enhancedTableContent = tryFormatAsEnhancedTable(fullData.parsedData);
            }
            if (!enhancedTableContent) {
                enhancedTableContent = tryFormatAsEnhancedTable(pricingRawContent);
            }
        }
    } else {
        // 常规处理逻辑
        if (fullData && fullData.parsedData) {
            // 尝试从解析的数据中提取表格数据
            enhancedTableContent = tryFormatAsEnhancedTable(fullData.parsedData);
        }
        
        // 如果没有解析数据，尝试从原始内容中提取
        if (!enhancedTableContent) {
            enhancedTableContent = tryFormatAsEnhancedTable(rawContent);
        }
    }
    
    currentModalData = {
        type: type,
        content: rawContent,
        formattedContent: enhancedTableContent || formatResultForModal(rawContent),
        fullData: fullData,
        hasEnhancedTable: !!enhancedTableContent
    };

    // 设置弹窗标题
    const modalTitle = document.getElementById('modal-title');
    const titles = {
        'pricing': '报价工作流 - 详细处理结果',
        'material': '物料查询工作流 - 详细处理结果',
        'excel': '报价Excel匹配 - 详细处理结果',
        'a': '报价工作流 - 详细处理结果', // 向后兼容
        'b': '物料查询工作流 - 详细处理结果', // 向后兼容
        'c': '报价Excel匹配 - 详细处理结果', // 向后兼容
        'file': '文件处理 - 详细处理结果'
    };
    modalTitle.textContent = titles[type] || '详细处理结果';

    // 设置弹窗内容
    const modalContent = document.getElementById('modal-result-content');
    
    // 构建完整的弹窗内容 - 只显示处理结果，移除完整响应数据
    let modalContentHtml = '';
    
    // 格式化的处理结果部分（直接展开，无需折叠功能）
    modalContentHtml += `
        <div class="content-section">
            <div class="section-content" id="formatted-section">
                ${currentModalData.formattedContent}
            </div>
        </div>
    `;
    
    modalContent.innerHTML = modalContentHtml;

    // 显示弹窗
    document.getElementById('result-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
    document.body.classList.add('modal-open'); // 防止背景滚动并确保全屏显示
    
    // 初始化模态框滚轮功能
    setTimeout(() => {
        initializeModalScrollFeatures();
    }, 50);
}

// 初始化模态框滚轮功能
function initializeModalScrollFeatures() {
    const modalBody = document.querySelector('.modal-body');
    const modalResultContent = document.getElementById('modal-result-content');
    
    if (!modalBody || !modalResultContent) {
        console.log('❌ 模态框元素未找到');
        return;
    }
    
    // 确保模态框主体有正确的滚动设置
    modalBody.style.overflowY = 'auto';
    modalBody.style.overflowX = 'hidden';
    // 不设置maxHeight，让CSS控制，确保flex布局正常工作
    
    // 添加滚轮事件监听器
    modalBody.addEventListener('wheel', function(e) {
        // 检查是否需要滚动
        const isScrollable = this.scrollHeight > this.clientHeight;
        
        if (isScrollable) {
            // 检查滚动方向和当前滚动位置
            const deltaY = e.deltaY;
            const scrollTop = this.scrollTop;
            const scrollHeight = this.scrollHeight;
            const clientHeight = this.clientHeight;
            
            // 如果向上滚动且已经在顶部，或向下滚动且已经在底部，则允许事件冒泡
            const atTop = scrollTop === 0;
            const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
            
            if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
                // 在边界处，允许事件冒泡到父元素
                return;
            } else {
                // 在内容区域内，阻止事件冒泡
                e.stopPropagation();
            }
        }
        // 如果不可滚动，允许事件正常传播
    });
    
    // 添加滚轮功能测试日志
    modalBody.addEventListener('wheel', function(e) {
        console.log(`🖱️ 模态框滚轮事件触发, deltaY: ${e.deltaY}, scrollTop: ${this.scrollTop}`);
    }, { passive: true });
    
    // 检查内容是否需要滚动
    const contentHeight = modalResultContent.scrollHeight;
    const containerHeight = modalBody.clientHeight;
    
    console.log(`📏 模态框内容高度: ${contentHeight}, 容器高度: ${containerHeight}`);
    
    if (contentHeight > containerHeight) {
        console.log('✅ 模态框滚动条应该可见');
    } else {
        console.log('ℹ️ 模态框内容无需滚动');
    }
    
    // 为section-content区域添加滚轮事件处理
    const sectionContentElements = modalResultContent.querySelectorAll('.section-content');
    sectionContentElements.forEach((sectionElement, index) => {
        sectionElement.addEventListener('wheel', function(e) {
            const isScrollable = this.scrollHeight > this.clientHeight;
            
            if (isScrollable) {
                const deltaY = e.deltaY;
                const scrollTop = this.scrollTop;
                const scrollHeight = this.scrollHeight;
                const clientHeight = this.clientHeight;
                
                const atTop = scrollTop === 0;
                const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
                
                if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
                    // 在边界处，允许事件冒泡到模态框主体
                    return;
                } else {
                    // 在内容区域内，阻止事件冒泡
                    e.stopPropagation();
                }
            }
        });
        
        console.log(`✅ 内容区域 ${index + 1} 滚轮功能已初始化`);
    });
    
    // 为JSON数据区域添加滚轮事件处理
    const jsonDataElements = modalResultContent.querySelectorAll('.json-data');
    jsonDataElements.forEach((jsonElement, index) => {
        jsonElement.addEventListener('wheel', function(e) {
            const isScrollable = this.scrollHeight > this.clientHeight;
            
            if (isScrollable) {
                const deltaY = e.deltaY;
                const scrollTop = this.scrollTop;
                const scrollHeight = this.scrollHeight;
                const clientHeight = this.clientHeight;
                
                const atTop = scrollTop === 0;
                const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
                
                if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
                    // 在边界处，允许事件冒泡到模态框主体
                    return;
                } else {
                    // 在JSON内容区域内，阻止事件冒泡
                    e.stopPropagation();
                }
            }
        });
        
        console.log(`✅ JSON数据区域 ${index + 1} 滚轮功能已初始化`);
    });
    
    console.log('✅ 模态框滚轮功能已初始化');
}

// 格式化结果内容用于弹窗显示
function formatResultForModal(content) {
    if (!content) {
        return '<p class="no-content">暂无内容</p>';
    }

    // 检查是否是药品分析结果（包含ID、物料等关键词）
    if (content.includes('ID：') && content.includes('物料：')) {
        return formatPharmacyAnalysis(content);
    }

    // 通用格式化
    return formatGeneralContent(content);
}

// 标准化大模型输出格式
function standardizeModelOutput(content) {
    console.log('Standardizing model output...');
    
    if (!content || typeof content !== 'string') {
        return content;
    }
    
    // 1. 统一换行符
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // 2. 修复标题格式不一致问题
    content = content.replace(/^###\s*ID[：:]/gm, '### ID：');
    content = content.replace(/^####\s*([^：:\n]+?)\s*$/gm, '#### $1');
    
    // 3. 修复表格格式问题
    content = content.replace(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g, 
        '| $1 | $2 | $3 | $4 |');
    
    // 4. 修复列表格式
    content = content.replace(/^[\s]*[-*]\s*\*\*([^*]+)\*\*[：:]?\s*/gm, '- **$1**：');
    content = content.replace(/^[\s]*[-*]\s*([^：:\n]+)[：:]?\s*/gm, '- $1：');
    
    // 5. 修复数字列表格式
    content = content.replace(/^[\s]*(\d+)\.\s*\*\*([^*]+)\*\*[：:]?\s*/gm, '$1. **$2**：');
    
    // 6. 统一日期格式
    content = content.replace(/(\d{4})[-_](\d{2})[-_](\d{2})/g, '$1-$2-$3');
    
    // 7. 修复厂家信息格式
    content = content.replace(/（([^）]+)）/g, '（$1）');
    
    // 8. 确保每个主要部分都有完整的结构
    content = ensureCompleteStructure(content);
    
    console.log('Model output standardization completed');
    return content;
}

// 确保每个药品分析部分都有完整的结构
function ensureCompleteStructure(content) {
    const sections = content.split(/###\s*/).filter(section => section.trim());
    let standardizedSections = [];
    
    sections.forEach(section => {
        if (!section.trim()) return;
        
        let standardizedSection = section;
        
        // 确保有基本的子部分
        const requiredSubSections = ['销售数据概况', '分析', '报价建议', '风险与机会'];
        
        requiredSubSections.forEach(subSection => {
            if (!standardizedSection.includes(`#### ${subSection}`)) {
                // 如果缺少某个子部分，尝试从内容中推断
                if (subSection === '销售数据概况' && !standardizedSection.includes('#### 销售数据概况')) {
                    if (standardizedSection.includes('交易记录') || standardizedSection.includes('价格') || standardizedSection.includes('采购量')) {
                        standardizedSection = standardizedSection.replace(
                            /(交易记录|价格|采购量)/,
                            '#### 销售数据概况\n- **$1'
                        );
                    }
                }
                
                if (subSection === '分析' && !standardizedSection.includes('#### 分析')) {
                    if (standardizedSection.includes('销售趋势') || standardizedSection.includes('利润率') || standardizedSection.includes('客户价值')) {
                        standardizedSection = standardizedSection.replace(
                            /(销售趋势|利润率|客户价值)/,
                            '#### 分析\n1. **$1'
                        );
                    }
                }
                
                if (subSection === '报价建议' && !standardizedSection.includes('#### 报价建议')) {
                    if (standardizedSection.includes('采购量（盒）') || standardizedSection.includes('价格（元/盒）')) {
                        const tableMatch = standardizedSection.match(/\|[^|]*采购量[^|]*\|[\s\S]*?\|[^|]*\|/);
                        if (tableMatch) {
                            standardizedSection = standardizedSection.replace(
                                tableMatch[0],
                                '#### 报价建议\n' + tableMatch[0]
                            );
                        }
                    }
                }
                
                if (subSection === '风险与机会' && !standardizedSection.includes('#### 风险与机会')) {
                    if (standardizedSection.includes('风险') || standardizedSection.includes('机会')) {
                        standardizedSection = standardizedSection.replace(
                            /([-*]\s*\*\*风险\*\*|[-*]\s*\*\*机会\*\*)/,
                            '#### 风险与机会\n$1'
                        );
                    }
                }
            }
        });
        
        standardizedSections.push(standardizedSection);
    });
    
    return standardizedSections.join('\n\n### ');
}

// 按ID分组药品数据
function groupSectionsByID(sections) {
    const groups = {};
    
    sections.forEach(section => {
        if (!section.trim()) return;
        
        // 提取ID信息
        const idMatch = section.match(/ID[：:]\s*(\d+)/);
        if (idMatch) {
            const drugId = idMatch[1];
            
            // 提取物料和厂家信息用于显示
            const materialMatch = section.match(/物料[：:]\s*([^|]+)/);
            const manufacturerMatch = section.match(/生产厂家[：:]\s*([^|\n]+)/);
            
            const drugInfo = {
                id: drugId,
                material: materialMatch ? materialMatch[1].trim() : '',
                manufacturer: manufacturerMatch ? manufacturerMatch[1].trim() : ''
            };
            
            if (!groups[drugId]) {
                groups[drugId] = {
                    drugInfo: drugInfo,
                    sections: []
                };
            }
            
            groups[drugId].sections.push(section);
        }
    });
    
    return groups;
}

// 格式化药品组（相同ID的所有数据）
function formatDrugGroup(drugId, drugData, groupIndex) {
    const { drugInfo, sections } = drugData;
    const groupId = `drug-group-${drugId}-${groupIndex}`;
    
    // 创建组标题
    const groupTitle = `${drugInfo.material} (ID: ${drugInfo.id}) - ${drugInfo.manufacturer}`;
    
    let groupContent = '';
    
    // 格式化组内的每个分析报告
    sections.forEach((section, sectionIndex) => {
        // 格式化单个分析报告 - 传递唯一的组标识符
        const uniqueIndex = `${drugId}-${groupIndex}-${sectionIndex}`;
        const formattedSection = formatPharmacyMainSection(section, uniqueIndex);
        
        // 直接添加分析内容，不需要额外的折叠层级
        groupContent += formattedSection;
    });
    
    // 返回完整的药品组HTML
    return `
        <div class="drug-group">
            <div class="drug-group-header" onclick="toggleSection('${groupId}')">
                <h3 class="drug-group-title">💊 ${groupTitle}</h3>
                <span class="drug-count">${sections.length} 条分析记录</span>
                <span class="toggle-icon collapsed" id="${groupId}-toggle">▶</span>
            </div>
            <div class="drug-group-content collapsed" id="${groupId}">
                ${groupContent}
            </div>
        </div>
    `;
}

// 格式化药品分析结果
function formatPharmacyAnalysis(content) {
    // 首先标准化输出格式
    const standardizedContent = standardizeModelOutput(content);
    
    // 按照 ### 分割主要药品分析报告（确保不匹配 ####）
    const sections = standardizedContent.split(/^###\s+(?!#)/gm);
    let formattedHtml = '';

    if (sections.length > 1) {
        // 如果找到了 ### 格式的分节符，按ID分组
        const validSections = sections.filter((section, index) => {
            return section.trim() && (index === 0 ? section.includes('ID：') : true);
        });
        
        // 按ID分组药品数据
        const groupedSections = groupSectionsByID(validSections);
        
        // 为每个ID组创建主折叠容器
        Object.keys(groupedSections).forEach((drugId, groupIndex) => {
            const drugSections = groupedSections[drugId];
            formattedHtml += formatDrugGroup(drugId, drugSections, groupIndex);
        });
    } else {
        // 如果没有找到 ### 格式，检查是否包含药品信息
        if (standardizedContent.includes('ID：')) {
            formattedHtml = formatPharmacyMainSection(standardizedContent, 1);
        } else {
            // 使用通用格式化
            formattedHtml = formatGeneralContent(standardizedContent);
        }
    }

    const result = formattedHtml || `<div class="formatted-content">${standardizedContent.replace(/\n/g, '<br>')}</div>`;
    console.log('formatPharmacyAnalysis result:', result);
    return result;
}

// 格式化主要药品分析报告（### 级别）
function formatPharmacyMainSection(section, index) {
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
        return '';
    }

    let html = `<div class="pharmacy-main-section">`;
    
    // 查找主标题行（包含ID的行）
    let titleLine = '';
    let contentStartIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('ID：')) {
            titleLine = lines[i];
            contentStartIndex = i + 1;
            break;
        }
    }
    
    // 创建主标题的可折叠部分
    if (titleLine) {
        const mainSectionId = `main-section-${index}`;
        
        html += `<div class="main-content-section">
            <div class="main-section-header" onclick="toggleSection('${mainSectionId}')">
                <span class="main-section-title">${titleLine}</span>
            </div>
            <div class="main-section-content collapsed" id="${mainSectionId}">`;
        
        // 处理 #### 级别的子部分
        html += formatSubSections(lines.slice(contentStartIndex), index);
        
        html += `</div></div>`;
    } else {
        // 如果没有找到标题，直接处理内容
        html += formatSubSections(lines, index);
    }

    html += `</div>`;
    console.log('formatPharmacyMainSection result:', html);
    return html;
}

// 格式化子部分（#### 级别）
function formatSubSections(lines, mainIndex) {
    let html = '';
    let currentSubSection = '';
    let currentSubContent = [];
    let subSectionCounter = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 识别各种标题格式：#### 、### #、**####
        if (line.startsWith('#### ') || line.startsWith('### #') || line.match(/^\s*\*+####/)) {
            // 保存上一个sub-section
            if (currentSubSection && currentSubContent.length > 0) {
                subSectionCounter++;
                html += formatCollapsibleSubSection(currentSubSection, currentSubContent, `sub-section-${mainIndex}-${subSectionCounter}`);
            }
            
            // 开始新sub-section - 清理各种前缀和符号
            let cleanTitle = line;
            cleanTitle = cleanTitle.replace(/^#### /, '');  // 移除#### 前缀
            cleanTitle = cleanTitle.replace(/^### #\s*/, '');  // 移除### # 前缀
            cleanTitle = cleanTitle.replace(/^\*+####\s*/, '');  // 移除**#### 前缀
            cleanTitle = cleanTitle.replace(/^\*+\s*/, '');  // 移除开头的*符号
            currentSubSection = cleanTitle.trim();
            currentSubContent = [];
        } else if (line) {
            if (currentSubSection) {
                currentSubContent.push(line);
            } else {
                // 如果没有当前sub-section，直接显示内容
                html += `<div class="section-text">${formatLineContent(line)}</div>`;
            }
        }
    }

    // 处理最后一个sub-section
    if (currentSubSection && currentSubContent.length > 0) {
        subSectionCounter++;
        html += formatCollapsibleSubSection(currentSubSection, currentSubContent, `sub-section-${mainIndex}-${subSectionCounter}`);
    }

    return html;
}

// 格式化可折叠的子部分
function formatCollapsibleSubSection(title, content, sectionId) {
    let html = `<div class="sub-content-section">
        <div class="sub-section-header" onclick="toggleSection('${sectionId}')">
            <span class="sub-section-title">${title}</span>
            <span class="toggle-icon collapsed">▶</span>
        </div>
        <div class="sub-section-content collapsed" id="${sectionId}">`;

    content.forEach(line => {
        html += `<div class="content-line">${formatLineContent(line)}</div>`;
    });

    html += `</div></div>`;
    return html;
}

// 格式化单行内容（处理表格、列表等）
function formatLineContent(line) {
    const originalLine = line;
    
    // 全面清理各种符号格式
    // 1. 清理### #格式的标题
    line = line.replace(/^(\s*)### #\s*/, '$1');
    line = line.replace(/### #\s*/g, '');
    
    // 2. 清理**#### 格式的标题（包括前面有空格的情况）
    line = line.replace(/^(\s*)\*\*####\s*/, '$1');
    line = line.replace(/\*\*####\s*/g, '');
    
    // 3. 清理单独的#### 标记（如果不是真正的标题）
    line = line.replace(/^(\s*)####\s*(?=\S)/g, '$1');
    line = line.replace(/####\s*(?=\S)/g, '');
    
    // 4. 清理行首的**符号（如果不是粗体格式）
    line = line.replace(/^(\s*)\*\*(?!.*\*\*)/g, '$1');
    
    // 5. 清理其他多余的*符号组合
    line = line.replace(/^(\s*)\*+(?!\*)/g, '$1');  // 清理行首的单独*符号
    
    // 6. 清理行中间的孤立符号
    line = line.replace(/\s+\*\*####\s*/g, ' ');
    line = line.replace(/\s+### #\s*/g, ' ');
    
    // 清理多余的空格
    line = line.trim();
    
    // 调试日志
    if (originalLine !== line && (originalLine.includes('### #') || originalLine.includes('**####'))) {
        console.log('符号清理:', originalLine, '->', line);
    }
    
    // 处理表格行（改进表格识别逻辑）
    if (line.includes('|')) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length >= 2) {
            // 检查是否是表格分隔行（如 |------|------|）
            const isSeparatorRow = cells.every(cell => /^-+$/.test(cell));
            if (isSeparatorRow) {
                return ''; // 跳过分隔行
            }
            
            // 检查是否是表头行（包含中文字符或常见表头词汇）
            const isHeaderRow = cells.some(cell => 
                /[\u4e00-\u9fa5]/.test(cell) || 
                /采购量|价格|毛利|策略|风险|机会/.test(cell)
            );
            
            const rowClass = isHeaderRow ? 'table-row table-header' : 'table-row';
            
            return `<div class="${rowClass}">
                ${cells.map((cell, index) => {
                    const cellClass = isHeaderRow ? 'table-cell table-header-cell' : 'table-cell';
                    return `<div class="${cellClass}">${formatCellContent(cell)}</div>`;
                }).join('')}
            </div>`;
        }
    }
    
    // 处理列表项
    if (line.startsWith('- ')) {
        return `<div class="list-item">${formatTextContent(line.substring(2))}</div>`;
    }
    
    // 处理数字列表
    if (/^\d+\.\s/.test(line)) {
        return `<div class="numbered-item">${formatTextContent(line)}</div>`;
    }
    
    return formatTextContent(line);
}

// 格式化单元格内容
function formatCellContent(cell) {
    // 处理粗体文本
    if (cell.includes('**')) {
        cell = cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // 清理未配对的**符号
        cell = cell.replace(/\*\*(?![^*]*\*\*)/g, '');
    }
    
    // 处理百分比高亮
    if (cell.includes('%')) {
        cell = cell.replace(/(\d+\.?\d*%)/g, '<span class="percentage">$1</span>');
    }
    
    // 处理价格高亮
    if (cell.includes('元')) {
        cell = cell.replace(/(\d+\.?\d*元)/g, '<span class="price">$1</span>');
    }
    
    return cell;
}

// 格式化文本内容
function formatTextContent(text) {
    // 彻底清理多余的符号
    text = text.replace(/^### #\s*/g, '');  // 完全清理### #开头
    text = text.replace(/### #\s*/g, '');   // 清理文本中的### #
    text = text.replace(/^\*\*####\s*/g, '');  // 完全清理**####开头
    text = text.replace(/\*\*####\s*/g, '');   // 清理文本中的**####
    text = text.replace(/^####\s*(?=\S)/g, '');  // 清理单独的####
    text = text.replace(/####\s*(?=\S)/g, '');   // 清理文本中的####
    text = text.replace(/^\*\*\s*/, '');  // 清理行首的**
    text = text.replace(/^-\s*\*\*/, '- ');  // 清理列表项中的**
    
    // 处理粗体文本
    if (text.includes('**')) {
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // 清理未配对的**符号
        text = text.replace(/\*\*(?![^*]*\*\*)/g, '');
    }
    
    // 处理关键词高亮
    text = text.replace(/(风险|机会|建议|策略)/g, '<span class="keyword">$1</span>');
    
    // 处理数值高亮
    text = text.replace(/(\d+\.?\d*%)/g, '<span class="percentage">$1</span>');
    text = text.replace(/(\d+\.?\d*元)/g, '<span class="price">$1</span>');
    
    return text;
}

// 格式化单个药品条目（保留原有函数作为备用）
function formatPharmacyItem(section, index) {
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
        return '';
    }

    let html = `<div class="pharmacy-item">`;
    
    // 查找标题行（包含ID的行或###开头的行）
    let titleLine = '';
    let contentStartIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('ID：') || lines[i].startsWith('### ')) {
            titleLine = lines[i].startsWith('### ') ? lines[i].replace('### ', '') : lines[i];
            contentStartIndex = i;
            break;
        }
    }
    
    // 创建基本信息的可折叠部分
    if (titleLine) {
        const basicInfoId = `basic-info-${index}`;
        
        html += `<div class="content-section">
            <div class="section-header" onclick="toggleSection('${basicInfoId}')">
                <span class="section-title">${index}. ${titleLine}</span>
                <span class="toggle-icon collapsed">▶</span>
            </div>
            <div class="section-content collapsed" id="${basicInfoId}">
                <div class="basic-info">
                    <div class="info-item">基本信息已收纳在标题中</div>
                </div>
            </div>
        </div>`;
    }

    // 处理分析部分 - 支持####四级标题
    let currentSection = '';
    let currentSectionContent = [];
    let sectionCounter = 0;
    
    for (let i = contentStartIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('#### ') || line.startsWith('### #') || line.match(/^\s*\*\*####/)) {
            // 保存上一个section
            if (currentSection && currentSectionContent.length > 0) {
                sectionCounter++;
                html += formatCollapsibleSection(currentSection, currentSectionContent, `section-${index}-${sectionCounter}`);
            }
            
            // 开始新section - 清理各种前缀和符号
            let cleanTitle = line;
            cleanTitle = cleanTitle.replace(/^#### /, '');  // 移除#### 前缀
            cleanTitle = cleanTitle.replace(/^### #\s*/, '');  // 移除### # 前缀
            cleanTitle = cleanTitle.replace(/^\s*\*\*####\s*/, '');  // 移除**#### 前缀
            cleanTitle = cleanTitle.replace(/^\s*\*+\s*/, '');  // 移除开头的*符号
            cleanTitle = cleanTitle.replace('：', '');  // 移除冒号
            currentSection = cleanTitle.trim();
            currentSectionContent = [];
        } else if (line.endsWith('：') && !line.startsWith('####')) {
            // 保存上一个section
            if (currentSection && currentSectionContent.length > 0) {
                sectionCounter++;
                html += formatCollapsibleSection(currentSection, currentSectionContent, `section-${index}-${sectionCounter}`);
            }
            
            // 开始新section
            currentSection = line.replace('：', '');
            currentSectionContent = [];
        } else if (line.startsWith('**') && line.endsWith('**')) {
            // 保存上一个section
            if (currentSection && currentSectionContent.length > 0) {
                sectionCounter++;
                html += formatCollapsibleSection(currentSection, currentSectionContent, `section-${index}-${sectionCounter}`);
            }
            
            // 开始新section
            currentSection = line.replace(/\*\*/g, '');
            currentSectionContent = [];
        } else if (line) {
            if (currentSection) {
                currentSectionContent.push(line);
            } else {
                // 如果没有当前section，可能是独立的内容行
                if (line.startsWith('结论：')) {
                    // 特殊处理结论部分
                    const conclusionContent = line.replace('结论：', '').trim();
                    if (conclusionContent) {
                        sectionCounter++;
                        html += formatCollapsibleSection('结论', [conclusionContent], `section-${index}-${sectionCounter}`);
                    }
                } else {
                    html += `<div class="section-text">${formatLineContent(line)}</div>`;
                }
            }
        }
    }

    // 处理最后一个section
    if (currentSection && currentSectionContent.length > 0) {
        sectionCounter++;
        html += formatCollapsibleSection(currentSection, currentSectionContent, `section-${index}-${sectionCounter}`);
    }

    html += `</div>`;
    return html;
}

// 格式化分析section
function formatCollapsibleSection(title, content, sectionId) {
    let html = `<div class="content-section">
        <div class="section-header" onclick="toggleSection('${sectionId}')">
            <span class="section-title">${title}</span>
            <span class="toggle-icon collapsed">▶</span>
        </div>
        <div class="section-content collapsed" id="${sectionId}">`;
    
    content.forEach(line => {
        if (line.startsWith('- ')) {
            html += `<div class="price-tier">${line.substring(2)}</div>`;
        } else {
            html += `<p class="section-text">${line}</p>`;
        }
    });
    
    html += `</div></div>`;
    return html;
}

// 保留原有的formatAnalysisSection函数以兼容其他地方的调用
function formatAnalysisSection(title, content) {
    let html = `<div class="analysis-section">
        <h4 class="section-title">${title}</h4>
        <div class="section-content">`;
    
    content.forEach(line => {
        if (line.startsWith('- ')) {
            html += `<div class="price-tier">${line.substring(2)}</div>`;
        } else {
            html += `<p class="section-text">${line}</p>`;
        }
    });
    
    html += `</div></div>`;
    return html;
}

// 格式化通用内容
function formatGeneralContent(content) {
    // 按段落分割
    const paragraphs = content.split('\n').filter(p => p.trim());
    let html = '<div class="formatted-content">';
    
    paragraphs.forEach(paragraph => {
        const trimmed = paragraph.trim();
        if (trimmed.startsWith('#')) {
            // 标题
            const level = (trimmed.match(/^#+/) || [''])[0].length;
            const title = trimmed.replace(/^#+\s*/, '');
            html += `<h${Math.min(level + 2, 6)} class="content-title">${title}</h${Math.min(level + 2, 6)}>`;
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            // 列表项
            html += `<div class="list-item">${trimmed.substring(2)}</div>`;
        } else if (trimmed) {
            // 普通段落
            html += `<p class="content-paragraph">${trimmed}</p>`;
        }
    });
    
    html += '</div>';
    return html;
}

// 关闭弹窗
function closeResultModal() {
    document.getElementById('result-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
    document.body.classList.remove('modal-open'); // 恢复背景滚动
}

// 复制弹窗中的结果
function copyModalResult() {
    if (!currentModalData.content) {
        showNotification('暂无内容可复制', 'warning');
        return;
    }

    navigator.clipboard.writeText(currentModalData.content).then(() => {
        showNotification('详细结果已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动选择复制', 'error');
    });
}

// 下载弹窗中的结果
function downloadModalResult() {
    if (!currentModalData.content) {
        showNotification('暂无内容可下载', 'warning');
        return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    // 检查是否有Excel表格数据
    let excelData = null;
    
    // 检查不同的数据结构
    if (currentModalData.fullData) {
        if (currentModalData.fullData.parsedData) {
            excelData = currentModalData.fullData.parsedData;
        } else if (currentModalData.fullData.workflowResult && currentModalData.fullData.workflowResult.parsedData) {
            // Excel数据可能在workflowResult.parsedData中
            const workflowData = currentModalData.fullData.workflowResult.parsedData;
            if (workflowData.down_url && Array.isArray(workflowData.down_url)) {
                // 将down_url数组转换为表格数据
                excelData = workflowData.down_url.map(item => {
                    try {
                        return parseDetailedExcelRow(item);
                    } catch (error) {
                        console.error('解析Excel行数据失败:', error);
                        return {};
                    }
                });
            }
        }
    }
     
     if (currentModalData.hasEnhancedTable && excelData && Array.isArray(excelData) && excelData.length > 0) {
        try {
            // 下载Excel文件
            const fileName = `详细结果_${currentModalData.type}_${timestamp}.xlsx`;
            downloadExcelFile(excelData, fileName);
            showNotification('Excel文件下载完成', 'success');
        } catch (error) {
            console.error('Excel下载失败，回退到文本下载:', error);
            // 如果Excel下载失败，回退到文本下载
            const fileName = `详细结果_${currentModalData.type}_${timestamp}.txt`;
            downloadTextFile(currentModalData.content, fileName);
            showNotification('文本文件下载完成', 'success');
        }
    } else {
        // 下载文本文件
        const fileName = `详细结果_${currentModalData.type}_${timestamp}.txt`;
        downloadTextFile(currentModalData.content, fileName);
        showNotification('详细结果下载完成', 'success');
    }
}

// 键盘事件处理
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('result-modal');
        if (modal && modal.style.display === 'block') {
            closeResultModal();
        }
    }
    
    // Ctrl+C 复制选中的UID
    if (event.ctrlKey && event.key === 'c') {
        const modal = document.getElementById('result-modal');
        if (modal && modal.style.display === 'block') {
            // 检查是否在增强版表格模态框中
            const enhancedTable = modal.querySelector('.enhanced-material-table');
            if (enhancedTable && selectedUids.size > 0) {
                event.preventDefault(); // 阻止默认的复制行为
                copySelectedUids();
                return;
            }
        }
    }
});

// 切换section显示/隐藏
function toggleSection(sectionId) {
    console.log('toggleSection called with sectionId:', sectionId);
    
    const content = document.getElementById(sectionId);
    console.log('content element:', content);
    
    if (!content) {
        console.error('Content element not found for sectionId:', sectionId);
        return;
    }
    
    // 查找对应的toggle图标
    let icon = null;
    
    // 首先尝试查找新结构中的toggle图标（在同一个header中）
    const sectionHeader = content.previousElementSibling;
    if (sectionHeader) {
        // 检查各种可能的header类
        if (sectionHeader.classList.contains('section-header') || 
            sectionHeader.classList.contains('drug-group-header') ||
            sectionHeader.classList.contains('analysis-header') ||
            sectionHeader.classList.contains('sub-section-header') ||
            sectionHeader.classList.contains('main-section-header')) {
            icon = sectionHeader.querySelector('.toggle-icon');
        }
    }
    
    // 如果没找到，尝试通过ID查找（用于模态框中的特殊部分）
    if (!icon) {
        let toggleId;
        if (sectionId === 'formatted-section') {
            toggleId = 'formatted-toggle';
        } else if (sectionId === 'raw-data-section') {
            toggleId = 'raw-data-toggle';
        } else {
            toggleId = sectionId + '-toggle';
        }
        icon = document.getElementById(toggleId);
    }
    
    console.log('toggle icon element:', icon);
    
    if (!icon) {
        console.error('Icon element not found for sectionId:', sectionId);
        return;
    }
    
    // 切换显示状态
    const isCollapsed = content.classList.contains('collapsed');
    
    if (isCollapsed) {
        // 展开
        content.classList.remove('collapsed');
        icon.classList.remove('collapsed');
        icon.textContent = '▼';
        console.log('Section expanded');
    } else {
        // 折叠
        content.classList.add('collapsed');
        icon.classList.add('collapsed');
        icon.textContent = '▶';
        console.log('Section collapsed');
    }
}

// ==================== 新增：界面导航功能 ====================

// 界面切换功能
function openWorkflowPage(pageType) {
    const mainMenu = document.getElementById('main-menu');
    const pricingPage = document.getElementById('pricing-workflow-page');
    const materialPage = document.getElementById('material-workflow-page');
    const excelPage = document.getElementById('excel-workflow-page');
    const navButtons = document.getElementById('nav-buttons');
    
    // 隐藏所有界面
    mainMenu.style.display = 'none';
    pricingPage.style.display = 'none';
    materialPage.style.display = 'none';
    excelPage.style.display = 'none';
    
    // 显示导航按钮
    navButtons.style.display = 'block';
    
    // 根据页面类型显示对应界面
    if (pageType === 'pricing') {
        pricingPage.style.display = 'block';
        // 重置报价工作流的状态
        resetPricingWorkflow();
    } else if (pageType === 'material') {
        materialPage.style.display = 'block';
        // 重置物料查询工作流的状态
        resetMaterialWorkflow();
    } else if (pageType === 'excel') {
        excelPage.style.display = 'block';
        // 重置Excel工作流的状态
        resetExcelWorkflow();
        // 初始化拖拽功能
        setupExcelDragAndDrop();
    }
    
    // 添加页面切换动画
    setTimeout(() => {
        if (pageType === 'pricing') {
            pricingPage.style.animation = 'fadeIn 0.5s ease-in-out';
        } else if (pageType === 'material') {
            materialPage.style.animation = 'fadeIn 0.5s ease-in-out';
        } else if (pageType === 'excel') {
            excelPage.style.animation = 'fadeIn 0.5s ease-in-out';
        }
    }, 50);
}

// 返回主菜单
function showMainMenu() {
    const mainMenu = document.getElementById('main-menu');
    const pricingPage = document.getElementById('pricing-workflow-page');
    const materialPage = document.getElementById('material-workflow-page');
    const excelPage = document.getElementById('excel-workflow-page');
    const navButtons = document.getElementById('nav-buttons');
    
    // 隐藏所有子页面
    pricingPage.style.display = 'none';
    materialPage.style.display = 'none';
    excelPage.style.display = 'none';
    navButtons.style.display = 'none';
    
    // 显示主菜单
    mainMenu.style.display = 'block';
    mainMenu.style.animation = 'fadeIn 0.5s ease-in-out';
}

// 重置报价工作流状态
function resetPricingWorkflow() {
    const input = document.getElementById('pricing-input');
    const resultArea = document.getElementById('pricing-result');
    
    if (input) {
        input.value = '';
    }
    
    if (resultArea) {
        resultArea.style.display = 'none';
        const resultContent = resultArea.querySelector('.result-content');
        if (resultContent) {
            resultContent.innerHTML = '';
        }
    }
}

// 重置物料查询工作流状态
function resetMaterialWorkflow() {
    const input = document.getElementById('material-input');
    const resultArea = document.getElementById('material-result');
    
    if (input) {
        input.value = '';
    }
    
    if (resultArea) {
        resultArea.style.display = 'none';
        const resultContent = resultArea.querySelector('.result-content');
        if (resultContent) {
            resultContent.innerHTML = '';
        }
    }
}

// 重置Excel工作流状态
function resetExcelWorkflow() {
    const fileInput = document.getElementById('excel-file-input');
    const fileInfo = document.getElementById('excel-file-info');
    const resultArea = document.getElementById('excel-result');
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    if (fileInfo) {
        fileInfo.innerHTML = '';
        fileInfo.style.display = 'none';
    }
    
    if (resultArea) {
        resultArea.style.display = 'none';
        const resultContent = resultArea.querySelector('.result-content');
        if (resultContent) {
            resultContent.innerHTML = '';
        }
    }
    
    // 重置全局状态
    currentFile = null;
    isProcessing = false;
    if (fullResponseData) {
        fullResponseData.excel = null;
    }
}

// 重置原始工作流状态
// 添加测试数据到输入框的辅助函数
function addTestDataToInput(type = 'a') {
    const testContent = `### ID：1625 | 物料：酚咖片 | 规格：10片 | 生产厂家：中美上海施贵宝制药有限公司
#### 销售数据概况
- **交易记录**：4笔交易，涉及4个客户
- **价格区间**：7.75-7.75元/盒
- **平均采购量**：49.25盒/次
- **最近交易时间**：2025-10-08
- **销售频率**：较分散，8 - 10月均有交易
- **主要客户**：广东众翔药业有限公司（占比51.28%）、广东柏恩医药有限公司（占比25.64%）、广东培健泰药业有限公司（占比15.38%）

#### 分析
- **销售趋势**：从交易时间来看，8 - 10月均有销售，未呈现明显的时间分布模式，销售较为平稳。
- **利润率表现**：毛利率稳定在5.16%，波动较小，利润表现较为稳定。
- **价格稳定性**：价格始终为7.75元/盒，无波动，价格稳定性高。
- **客户价值评估**：客户分布较为分散，每个客户的采购量占比相对均衡，暂无特别突出的重要客户，客户采购稳定性需进一步观察更多交易数据。
- **旺季预测**：由于数据较少，难以明确判断旺季，从现有数据看，8 - 10月销售较平均，未体现季节性特征。

#### 报价建议
|采购量（盒）|价格（元/盒）|毛利率|备注|
|---|---|---|---|
|1 - 50|7.75|5.16%|维持现有价格，适合小批量采购客户|
|51 - 100|7.8|5.85%|给予一定价格提升，鼓励中等批量采购|
|101及以上|7.85|6.53%|更高价格以保证利润，针对大批量采购客户|

- **定价依据**：参考最近考核价7.35元，现有销售价7.75元，毛利率为5.16%。在保证毛利率不低于3%的前提下，根据采购量进行阶梯定价。小批量采购维持原价以保证客户不流失，中等和大批量采购适当提价以增加利润。
- **涨价潜力分析**：有一定涨价空间，若采购量达到101盒及以上，可提价至7.85元/盒，毛利率提升至6.53%。数据来源为现有交易数据和考核价，提价幅度建议在1 - 1.29%之间。

#### 风险与机会
- **风险**：客户数量较少，若个别客户流失，可能对销售产生较大影响；价格长期稳定，可能面临竞争对手低价冲击。
- **机会**：可拓展新客户，扩大市场份额；根据客户需求，提供增值服务，提高客户忠诚度。`;

    // 根据当前页面确定输入框ID
    let inputId;
    const isInPricingPage = document.getElementById('pricing-workflow-page').style.display !== 'none';
    
    if (isInPricingPage) {
        inputId = 'pricing-input';
    } else {
        inputId = `input-${type}`;
    }
    
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.value = testContent;
        showNotification('测试数据已添加到输入框', 'success');
    }
}

// 修改现有的初始化函数以包含主菜单显示
function initializeNavigation() {
    // 确保页面加载时显示主菜单
    showMainMenu();
}



// 导出新的函数到全局作用域
// Excel工作流处理函数
async function processExcelWorkflow() {
    if (!currentFile) {
        showNotification('请先选择Excel文件', 'error');
        return;
    }
    
    if (isProcessing) {
        showNotification('正在处理中，请稍候...', 'warning');
        return;
    }
    
    try {
        isProcessing = true;
        showLoading(true);
        
        console.log('开始处理Excel文件:', currentFile.name);
        
        // 调用文件上传和工作流处理
        const result = await processFileWithWorkflowC(currentFile);
        
        if (result) {
            // 显示结果
            displayResult('excel-result', result, result);
            fullResponseData.excel = result;
            showNotification('Excel文件处理完成！', 'success');
        } else {
            showNotification('Excel文件处理失败', 'error');
        }
        
    } catch (error) {
        console.error('Excel工作流处理错误:', error);
        showNotification(`处理失败: ${error.message}`, 'error');
    } finally {
        isProcessing = false;
        showLoading(false);
    }
}

// Excel文件选择处理
function handleExcelFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleExcelFile(file);
    }
}

function handleExcelFile(file) {
    // 验证文件类型
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        showNotification('请选择Excel文件 (.xlsx 或 .xls)', 'error');
        return;
    }
    
    // 验证文件大小 (限制为10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('文件大小不能超过10MB', 'error');
        return;
    }
    
    currentFile = file;
    displayExcelFileInfo(file);
    showNotification(`已选择文件: ${file.name}`, 'success');
}

function displayExcelFileInfo(file) {
    const fileInfo = document.getElementById('excel-file-info');
    const processBtn = document.getElementById('excel-process-btn');
    
    if (fileInfo) {
        fileInfo.innerHTML = `
            <div class="file-info-content">
                <div class="file-icon">📊</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                    <div class="file-type">Excel文件</div>
                </div>
            </div>
        `;
        fileInfo.style.display = 'block';
    }
    
    // 启用处理按钮
    if (processBtn) {
        processBtn.disabled = false;
    }
}

// 清除Excel文件
function clearExcelFile() {
    const fileInput = document.getElementById('excel-file-input');
    const fileInfo = document.getElementById('excel-file-info');
    const processBtn = document.getElementById('excel-process-btn');
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    if (fileInfo) {
        fileInfo.style.display = 'none';
        fileInfo.innerHTML = '';
    }
    
    if (processBtn) {
        processBtn.disabled = true;
    }
    
    currentFile = null;
    showNotification('已清除文件选择', 'info');
}



// 设置Excel文件拖拽功能
function setupExcelDragAndDrop() {
    const uploadZone = document.getElementById('excel-upload-zone');
    
    if (!uploadZone) return;
    
    // 防止默认拖拽行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // 高亮拖拽区域
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, unhighlight, false);
    });
    
    // 处理文件拖拽
    uploadZone.addEventListener('drop', handleExcelDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        uploadZone.classList.add('dragover');
    }
    
    function unhighlight(e) {
        uploadZone.classList.remove('dragover');
    }
    
    function handleExcelDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleExcelFile(files[0]);
        }
    }
}

window.openWorkflowPage = openWorkflowPage;
window.showMainMenu = showMainMenu;

window.processWorkflow = processWorkflow;
window.processFileWorkflow = processFileWorkflow;
window.processExcelWorkflow = processExcelWorkflow;
window.handleExcelFileSelect = handleExcelFileSelect;

window.clearExcelFile = clearExcelFile;
window.copyResult = copyResult;
window.downloadResult = downloadResult;
window.downloadProcessedFile = downloadProcessedFile;
window.downloadAllResults = downloadAllResults;

window.viewDetailedResult = viewDetailedResult;
window.closeResultModal = closeResultModal;
window.copyModalResult = copyModalResult;
window.downloadModalResult = downloadModalResult;
window.toggleSection = toggleSection;

// 测试Excel工作流数据处理的函数
function testExcelWorkflowData() {
    console.log('🧪 开始测试Excel工作流数据处理');
    
    // 使用用户提供的真实API响应数据
    const testApiResponse = {
        "usage": {
            "token_count": 0,
            "output_count": 0,
            "input_count": 0
        },
        "detail": {
            "logid": "202510211218392C7BD1B8DBA6385463F6"
        },
        "code": 0,
        "msg": "",
        "data": "{\"down_url\":[{\"approval_number\":\"国药准字Z44021522\",\"assessment_price\":6.88,\"buyer\":\"侯姣姣\",\"collective_price\":0,\"expiration_date\":\"2027-07-31 00:00:00 +0800 CST\",\"giveaway_strategy\":\"\",\"international_code\":\"6920674132057\",\"last_sale_date\":\"\",\"last_sale_price\":7.2,\"manufacture_date\":\"2025-08-22 00:00:00 +0800 CST\",\"manufacturer\":\"广东恒诚制药股份有限公司\",\"market_quantity\":31424,\"match_type\":\"药品特征\",\"medicine_name\":\"风寒感冒颗粒\",\"negotiated_price\":0,\"product_arrival_date\":\"0001-01-01 00:00:00 +0805 LMT\",\"prohibited_selling\":\"\",\"specific_price\":7.2,\"specifications\":\"8G*10袋\",\"uid\":52826,\"unstocked_quantity\":0,\"批准文号\":\"\",\"条形码\":\"\",\"物料名称\":\"风寒感冒颗粒\",\"生产厂家\":\"广东恒诚制药股份有限公司\",\"编码\":\"5898\",\"规格\":\"8g*10袋\"},{\"approval_number\":\"国药准字Z44020211\",\"assessment_price\":18.33,\"buyer\":\"李美红\",\"collective_price\":0,\"expiration_date\":\"2026-12-31 00:00:00 +0800 CST\",\"giveaway_strategy\":\"\",\"international_code\":\"6900372305069\",\"last_sale_date\":\"\",\"last_sale_price\":19,\"manufacture_date\":\"2025-01-01 00:00:00 +0800 CST\",\"manufacturer\":\"广州白云山光华制药股份有限公司\",\"market_quantity\":384089,\"match_type\":\"药品特征\",\"medicine_name\":\"小柴胡颗粒\",\"negotiated_price\":0,\"product_arrival_date\":\"0001-01-01 00:00:00 +0805 LMT\",\"prohibited_selling\":\"\",\"specific_price\":0,\"specifications\":\"10g*10袋\",\"uid\":704,\"unstocked_quantity\":0,\"批准文号\":\"\",\"条形码\":\"\",\"物料名称\":\"小柴胡颗粒\",\"生产厂家\":\"广州白云山光华制药股份有限公司\",\"编码\":\"1593\",\"规格\":\"10g*10袋\"},{\"approval_number\":\"\",\"assessment_price\":\"\",\"buyer\":\"\",\"collective_price\":\"\",\"expiration_date\":\"\",\"giveaway_strategy\":\"\",\"international_code\":\"\",\"last_sale_date\":\"\",\"last_sale_price\":\"\",\"manufacture_date\":\"\",\"manufacturer\":\"\",\"market_quantity\":\"\",\"match_type\":\"未匹配\",\"medicine_name\":\"\",\"negotiated_price\":\"\",\"product_arrival_date\":\"\",\"prohibited_selling\":\"\",\"specific_price\":\"\",\"specifications\":\"\",\"uid\":\"\",\"unstocked_quantity\":\"\",\"批准文号\":\"\",\"条形码\":\"\",\"物料名称\":\"咽炎片\",\"生产厂家\":\"吉林白山正茂药业股份有限公司\",\"编码\":\"16912\",\"规格\":\"0.25g*12片*2板(糖衣片)\"},{\"approval_number\":\"\",\"assessment_price\":\"\",\"buyer\":\"\",\"collective_price\":\"\",\"expiration_date\":\"\",\"giveaway_strategy\":\"\",\"international_code\":\"\",\"last_sale_date\":\"\",\"last_sale_price\":\"\",\"manufacture_date\":\"\",\"manufacturer\":\"\",\"market_quantity\":\"\",\"match_type\":\"未匹配\",\"medicine_name\":\"\",\"negotiated_price\":\"\",\"product_arrival_date\":\"\",\"prohibited_selling\":\"\",\"specific_price\":\"\",\"specifications\":\"\",\"uid\":\"\",\"unstocked_quantity\":\"\",\"批准文号\":\"\",\"条形码\":\"\",\"物料名称\":\"喉舒宁片\",\"生产厂家\":\"国药集团德众(佛山)药业有限公司\",\"编码\":\"2991\",\"规格\":\"50片\"},{\"approval_number\":\"\",\"assessment_price\":\"\",\"buyer\":\"\",\"collective_price\":\"\",\"expiration_date\":\"\",\"giveaway_strategy\":\"\",\"international_code\":\"\",\"last_sale_date\":\"\",\"last_sale_price\":\"\",\"manufacture_date\":\"\",\"manufacturer\":\"\",\"market_quantity\":\"\",\"match_type\":\"未匹配\",\"medicine_name\":\"\",\"negotiated_price\":\"\",\"product_arrival_date\":\"\",\"prohibited_selling\":\"\",\"specific_price\":\"\",\"specifications\":\"\",\"uid\":\"\",\"unstocked_quantity\":\"\",\"批准文号\":\"\",\"条形码\":\"\",\"物料名称\":\"感冒止咳胶囊\",\"生产厂家\":\"广东万方制药有限公司\",\"编码\":\"17007\",\"规格\":\"0.5g12粒\"},{\"approval_number\":\"国药准字Z45021731\",\"assessment_price\":23.13,\"buyer\":\"林绮琪\",\"collective_price\":0,\"expiration_date\":\"2027-10-31 00:00:00 +0800 CST\",\"giveaway_strategy\":\"一盒起，当批票折1.46元/盒【商业客户限1件政策，部分客户可享受3件政策】;\",\"international_code\":\"6901370001281\",\"last_sale_date\":\"\",\"last_sale_price\":24.5,\"manufacture_date\":\"2024-11-02 00:00:00 +0800 CST\",\"manufacturer\":\"广西玉林制药集团有限责任公司\",\"market_quantity\":11913,\"match_type\":\"药品特征\",\"medicine_name\":\"湿毒清胶囊\",\"negotiated_price\":0,\"product_arrival_date\":\"0001-01-01 00:00:00 +0805 LMT\",\"prohibited_selling\":\"\",\"specific_price\":24.48,\"specifications\":\"0.5G*30粒\",\"uid\":2067,\"unstocked_quantity\":0,\"批准文号\":\"\",\"条形码\":\"\",\"物料名称\":\"湿毒清胶囊\",\"生产厂家\":\"广西玉林制药集团有限责任公司\",\"编码\":\"1276\",\"规格\":\"0.5g*30粒\"},{\"approval_number\":\"\",\"assessment_price\":\"\",\"buyer\":\"\",\"collective_price\":\"\",\"expiration_date\":\"\",\"giveaway_strategy\":\"\",\"international_code\":\"\",\"last_sale_date\":\"\",\"last_sale_price\":\"\",\"manufacture_date\":\"\",\"manufacturer\":\"\",\"market_quantity\":\"\",\"match_type\":\"未匹配\",\"medicine_name\":\"\",\"negotiated_price\":\"\",\"product_arrival_date\":\"\",\"prohibited_selling\":\"\",\"specific_price\":\"\",\"specifications\":\"\",\"uid\":\"\",\"unstocked_quantity\":\"\",\"批准文号\":\"\",\"条形码\":\"\",\"物料名称\":\"匹维溴铵片（得舒特）\",\"生产厂家\":\"Mylan Laboratories SAS\",\"编码\":\"3278\",\"规格\":\"50mg*15片\"},{\"approval_number\":\"\",\"assessment_price\":\"\",\"buyer\":\"\",\"collective_price\":\"\",\"expiration_date\":\"\",\"giveaway_strategy\":\"\",\"international_code\":\"\",\"last_sale_date\":\"\",\"last_sale_price\":\"\",\"manufacture_date\":\"\",\"manufacturer\":\"\",\"market_quantity\":\"\",\"match_type\":\"未匹配\",\"medicine_name\":\"\",\"negotiated_price\":\"\",\"product_arrival_date\":\"\",\"prohibited_selling\":\"\",\"specific_price\":\"\",\"specifications\":\"\",\"uid\":\"\",\"unstocked_quantity\":\"\",\"批准文号\":\"\",\"条形码\":\"\",\"物料名称\":\"氯化钠注射液\",\"生产厂家\":\"中国大冢制药有限公司\",\"编码\":\"10174\",\"规格\":\"10ml：0.09g\"}]}",
        "debug_url": "https://www.coze.cn/work_flow?execute_id=7563524675373809673&space_id=7546844290333573160&workflow_id=7562027540538408996&execute_mode=2"
    };
    
    console.log('🧪 测试数据:', testApiResponse);
    
    // 调用displayResult函数测试
    displayResult('excel-result', testApiResponse, testApiResponse);
    
    console.log('🧪 测试完成，请检查Excel工作流页面的处理结果区域');
}

// 将测试函数暴露到全局
window.testExcelWorkflowData = testExcelWorkflowData;