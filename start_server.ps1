# 噼里啪啦小助手本地服务器启动脚本
Write-Host "启动噼里啪啦小助手本地服务器..." -ForegroundColor Green
Write-Host ""
Write-Host "服务器地址: http://localhost:8000" -ForegroundColor Yellow
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Cyan
Write-Host ""

# 切换到脚本所在目录
Set-Location $PSScriptRoot

# 启动HTTP服务器
try {
    python -m http.server 8000
} catch {
    Write-Host "启动失败，请确保已安装Python" -ForegroundColor Red
    Read-Host "按任意键退出"
}