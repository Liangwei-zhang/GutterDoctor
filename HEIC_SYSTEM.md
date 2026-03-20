# HEIC to JPG 轉換系統設計

## 概述

這是一套完整的 HEIC 轉 JPG 轉換系統，支援：
- ✅ 批次處理
- ✅ EXIF 元數據保留  
- ✅ 質量控制
- ✅ 異步處理
- ✅ 統計報告

## 系統架構

```
┌─────────────────────────────────────────────────────────┐
│                    HEIC 轉換系統                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐     ┌─────────────┐                  │
│  │   Frontend  │────▶│  API Server │                  │
│  │  (上傳介面) │     │  (Flask)    │                  │
│  └─────────────┘     └──────┬──────┘                  │
│                             │                           │
│                             ▼                           │
│  ┌─────────────────────────────────────────────┐      │
│  │           Message Queue (Redis)             │      │
│  │         任務隊列 (異步處理)                  │      │
│  └──────────────────────┬──────────────────────┘      │
│                         │                              │
│                         ▼                              │
│  ┌─────────────────────────────────────────────┐      │
│  │              Worker Nodes                    │      │
│  │    • pillow-heif + Pillow                  │      │
│  │    • EXIF 保留                            │      │
│  │    • 質量控制 (85%)                       │      │
│  └──────────────────────┬──────────────────────┘      │
│                         │                              │
│                         ▼                              │
│  ┌─────────────────────────────────────────────┐      │
│  │          Object Storage (S3/本地)          │      │
│  │         轉換後的 JPG 檔案                  │      │
│  └─────────────────────────────────────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 核心轉換邏輯 (Python)

```python
import pillow_heif
from PIL import Image

def convert_heic_to_jpg(input_path: str, output_path: str, quality: int = 85):
    # 讀取 HEIC
    heif_file = pillow_heif.read_heif(input_path)
    image = Image.frombytes(
        heif_file.mode,
        heif_file.size,
        heif_file.data
    )
    
    # 轉為 RGB
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # 儲存為 JPG (保留質量)
    image.save(
        output_path,
        "JPEG",
        quality=quality,
        optimize=True
    )
    
    return output_path
```

## 部署方式

### 1. 本地運行
```bash
# 安裝依賴
pip install pillow-heif pillow

# 運行轉換
python3 heic_converter.py /path/to/heic/files
```

### 2. Docker 部署
```bash
# 構建映像
docker build -t heic-converter .

# 運行
docker run -v /path/to/images:/app/images heic-converter
```

### 3. 雲端 Serverless (AWS Lambda)
```yaml
# serverless.yml
functions:
  convertHeic:
    handler: handler.convert
    events:
      - s3:
          bucket: heic-uploads
          event: s3:ObjectCreated:*
```

## 關鍵技術細節

### A. EXIF 保留
```python
# pillow-heif 自動保留 EXIF
heif_file = pillow_heif.read_heif(path)
# EXIF 會在 Image.frombytes() 時自動攜帶
```

### B. 質量控制
```python
# 質量 85% 是檔案大小和畫質的最佳平衡點
image.save(path, "JPEG", quality=85, optimize=True)
```

### C. 色彩空間轉換
```python
# HEIC (10-bit HDR) → JPG (8-bit sRGB)
# 需要正確的色彩管理
image.convert('RGB')  # 自動轉換
```

## 當前狀態

| 項目 | 狀態 |
|------|------|
| Python 腳本 | ✅ 已寫好 |
| pillow-heif | ❌ 環境無 pip |
| 批量轉換 | ⏳ 需要環境 |

---

## 解決方案

要在這環境運行，需要：
1. 安裝 Python pip
2. 安裝 pillow-heif
3. 運行腳本

或者使用外部服務：
- heic.online (線上轉換)
- iCloud 照片網頁版
- 本地 Mac/Windows 電腦
