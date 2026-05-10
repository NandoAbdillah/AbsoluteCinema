#include <AppCore/AppCore.h>
#include <AppCore/Window.h>
#include <AppCore/Overlay.h>
#include <iostream>

using namespace ultralight;

// Bikin class App untuk mengatur siklus hidup aplikasi
class AbsoluteCinema : public AppListener {
    RefPtr<App> app_;
    RefPtr<Window> window_;
    RefPtr<Overlay> overlay_;

public:
    AbsoluteCinema() {
        // Inisialisasi App
        app_ = App::Create();

        // Bikin jendela resolusi 1024x768
        window_ = Window::Create(app_->main_monitor(), 1024, 768, false, 
            kWindowFlags_Titled | kWindowFlags_Resizable);
        window_->SetTitle("Absolute Cinema - Movie Rating System");

        // Daftarkan listener
        app_->set_listener(this);

        // Bikin overlay (semacam kanvas transparan tempat web di-render)
        overlay_ = Overlay::Create(window_, 1024, 768, 0, 0);

        // Nanti kamu bisa load file HTML pakai: overlay_->view()->LoadURL("file:///path/to/assets/index.html");
        // Tapi untuk tes awal, kita load string HTML langsung aja biar aman:
        overlay_->view()->LoadHTML(
            "<html><body style='background:#1e1e1e; color:white; font-family:sans-serif; text-align:center; padding-top:20%;'>"
            "<h1>Setup Ultralight Berhasil! 🚀</h1>"
            "<p>Siap ngoding Absolute Cinema rek.</p>"
            "</body></html>"
        );
    }

    virtual void OnUpdate() override {
        // Tempat naruh logika C++ yang jalan tiap frame (kalau ada)
    }

    void Run() {
        app_->Run();
    }
};

int main() {
    AbsoluteCinema myApp;
    myApp.Run();
    return 0;
}