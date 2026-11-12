# 🎮 3D Tank Battle - Multiplayer Oyunu

Aynı ağdaki (LAN) bilgisayarlarda çalışan profesyonel 3D multiplayer tank savaş oyunu.

## ✨ Özellikler

- 🎯 **3D Grafik**: Three.js ile gerçekçi 3D ortam
- 🌐 **LAN Multiplayer**: Aynı ağdaki tüm bilgisayarlar birlikte oynayabilir
- ⚔️ **Gerçek Zamanlı Savaş**: Anlık çarpışmalar ve ateş sistemi
- 🏆 **Skor Sistemi**: Canlı skor tablosu
- 🎨 **Kaliteli Tasarım**: Gölgeler, ışıklandırma, efektler
- 🎮 **Kolay Kontrol**: WASD + Fare kontrolü

## 🚀 Kurulum

### 1. Node.js'i İndirin (Eğer yoksa)
https://nodejs.org/ adresinden LTS versiyonunu indirin ve kurun.

### 2. Projeyi Başlatın

Komut satırını açın ve sırayla şu komutları çalıştırın:

```cmd
npm install
npm start
```

### 3. Oyunu Açın

Server başladığında şu mesajı göreceksiniz:
```
✅ Server çalışıyor: http://localhost:3000
```

Tarayıcınızda `http://localhost:3000` adresini açın.

## 🌐 LAN Üzerinden Çoklu Oyuncu (Minecraft Gibi!)

### ✅ **Sunucu Bilgisayarda:**

1. `npm start` ile server'ı başlatın
2. Server başladığında IP adresinizi göreceksiniz
3. Windows'ta IP adresinizi öğrenmek için:
   ```cmd
   ipconfig
   ```
   **"IPv4 Address"** kısmını not edin (örn: `192.168.1.100`)

### 🎮 **Diğer Bilgisayarlarda:**

1. Tarayıcıyı açın (Chrome/Firefox/Edge)
2. Adres çubuğuna şunu yazın:
   ```
   http://[SUNUCU-IP]:3000
   ```
   **Örnek:** `http://192.168.1.100:3000`
   
3. İsminizi girin
4. **"OYUNA KATIL"** butonuna tıklayın
5. Savaşa başlayın!

**⚠️ ÖNEMLİ:** 
- Tüm bilgisayarlar **aynı WiFi/kablolu ağa** bağlı olmalıdır!
- Güvenlik duvarı uyarısı çıkarsa **"İzin ver"** seçin
- İnternet bağlantısı **GEREKMEZ** - sadece yerel ağ yeterli!

## 🎮 Kontroller

- **W** - İleri git
- **S** - Geri git  
- **A** - Sola dön
- **D** - Sağa dön
- **Sol Tık / Space** - Ateş et

## ✨ Özellikler

- ✅ **LAN Multiplayer** - Aynı ağdaki oyuncular birlikte oynar
- ✅ **Gerçek Zamanlı Savaş** - Anında çarpışmalar
- ✅ **İsim Sistemi** - Her oyuncu kendi ismini görür
- ✅ **Skor Tablosu** - Canlı sıralama
- ✅ **3D Grafik** - WebGL ile profesyonel görünüm
- ✅ **Patlama Efektleri** - Görsel ve ses efektleri

## 🎯 Oyun Kuralları

1. Düşman tanklarını vur
2. Her vuruş 25 hasar verir
3. Can bitince 2 saniye sonra yeniden doğarsın
4. Her öldürme +1 puan kazandırır
5. En yüksek skoru hedefle!

## 🛠️ Teknik Detaylar

- **Frontend**: Three.js (3D grafik)
- **Backend**: Node.js + Express + Socket.IO
- **Gerçek zamanlı iletişim**: WebSocket
- **Platform**: Web (Tüm tarayıcılarda çalışır)

## 📝 Not

Güvenlik duvarı uyarısı alırsanız "İzin ver" seçeneğine tıklayın. Bu, diğer bilgisayarların sunucunuza bağlanabilmesi için gereklidir.

## 🎨 Özelleştirme

Oyunu özelleştirmek için:
- `server.js` - Oyun mantığı, hasar, skor
- `public/game.js` - Grafik, kontroller, efektler  
- `public/index.html` - Arayüz, renkler, stil

İyi Oyunlar! 🎮🚀
