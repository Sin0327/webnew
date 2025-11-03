import asyncio
from aiofile import async_open
from aiohttp import web
import webbrowser
import os
from threading import Thread

class UltraFastServer:
    def __init__(self, port=8000):
        self.port = port
        self.app = web.Application()
        self.setup_routes()
    
    def setup_routes(self):
        # 服务静态文件
        self.app.router.add_get('/', self.serve_index)
        self.app.router.add_get('/{filename}', self.serve_static)
        self.app.router.add_static('/static/', path=os.path.dirname(__file__))
    
    async def serve_index(self, request):
        return await self.serve_file('index.html')
    
    async def serve_static(self, request):
        filename = request.match_info['filename']
        return await self.serve_file(filename)
    
    async def serve_file(self, filename):
        filepath = os.path.join(os.path.dirname(__file__), filename)
        
        if not os.path.exists(filepath):
            return web.Response(text='File not found', status=404)
        
        async with async_open(filepath, 'rb') as f:
            content = await f.read()
        
        # 根据文件类型设置 Content-Type
        content_type = 'text/html'
        if filename.endswith('.css'):
            content_type = 'text/css'
        elif filename.endswith('.js'):
            content_type = 'application/javascript'
        elif filename.endswith('.png'):
            content_type = 'image/png'
        elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
            content_type = 'image/jpeg'
        
        return web.Response(body=content, content_type=content_type)
    
    def run(self):
        web.run_app(self.app, port=self.port, print=None)

def start_ultra_fast_server():
    server = UltraFastServer(8000)
    print(f"⚡ 超高速服务器启动在 http://localhost:8000")
    
    # 在后台启动服务器
    server_thread = Thread(target=server.run)
    server_thread.daemon = True
    server_thread.start()
    
    # 等待服务器启动
    import time
    time.sleep(1)
    webbrowser.open('http://localhost:8000')
    
    print("⏹️  按 Enter 键停止服务器")
    input()

if __name__ == "__main__":
    start_ultra_fast_server()