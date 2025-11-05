// server.js

const express = require('express');
const axios = require('axios');
const app = express();
// Vercel 會自動指定 Port，本地測試時我們用 3000
const port = process.env.PORT || 3000; 

// 原始 API 的基礎 URL
const TARGET_BASE_URL = 'https://xcelleratesports.com/api/v1/rosters/';
// 從環境變數讀取密鑰，稍後會在 Vercel 平台上設定
const YOUR_API_KEY = process.env.XCELLERATE_API_KEY; 

// 這是一個簡單的防呆檢查
if (!YOUR_API_KEY) {
    console.error("ERROR: XCELLERATE_API_KEY 環境變數尚未設定！請在 Vercel 中設定。");
}

// 設定 Flowics 將會呼叫的 API 端點
app.get('/get_roster_data', async (req, res) => {
    // 從 Flowics 傳來的 URL 參數中取得 roster ID (例如 ?id=161176)
    const rosterId = req.query.id || '161176'; 
    const targetUrl = `${TARGET_BASE_URL}${rosterId}`;
    
    console.log(`正在代理請求至: ${targetUrl}`);

    try {
        // 使用 axios 發送請求給目標 API，並加入 Header 驗證
        const response = await axios.get(targetUrl, {
            headers: {
                // 加入 API Key 到 Header 中
                'X-API-KEY': YOUR_API_KEY 
            }
        });

        // 成功取得資料，回傳給 Flowics
        res.status(200).json(response.data);

    } catch (error) {
        // 如果驗證失敗或其他錯誤
        console.error('從目標 API 獲取資料失敗:', error.message);
        
        // 最好回傳一個標準的 JSON 錯誤，避免 Flowics 語法解析錯誤
        res.status(error.response?.status || 500).json({
            error: 'Failed to retrieve data from target API',
            details: error.message
        });
    }
});

// 啟動伺服器 (在 Vercel 上這會自動處理)
app.listen(port, () => {
    console.log(`代理伺服器已啟動，監聽 Port ${port}`);
});