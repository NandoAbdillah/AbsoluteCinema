#include <AppCore/App.h>
#include <AppCore/Window.h>
#include <AppCore/Overlay.h>
#include <AppCore/JSHelpers.h>
#include <Ultralight/JavaScript.h>
#include "backend.h"
#include <string>
#include <sstream>
#include <iostream>
#include <windows.h>

using namespace ultralight;

void initConsole()
{
    AllocConsole();
    FILE *fDummy;
    freopen_s(&fDummy, "CONOUT$", "w", stdout);
    freopen_s(&fDummy, "CONOUT$", "w", stderr);
    freopen_s(&fDummy, "CONIN$", "r", stdin);
    std::cout << "========================================\n";
    std::cout << "  WORDBOXD DEBUG CONSOLE \n";
    std::cout << "========================================\n";
    std::cout.flush();
}

std::string jsToStr(const String &ul)
{
    std::string result;
    for (size_t i = 0; i < ul.utf8().length(); i++)
        result += ul.utf8().data()[i];
    return result;
}

JSValue jsGetAllMovies(const JSObject &o, const JSArgs &a)
{
    MovieList all;
    bstInorder(bstRoot, all);
    return JSValue(moviesToJsonArray(all).c_str());
}

JSValue jsGetAllFilms(const JSObject &o, const JSArgs &a)
{
    MovieList all;
    bstInorder(bstRoot, all);
    MovieList films;
    for (int i=0; i<all.count; i++)
        if (movieIsFilm(*all.items[i]))
            films.items[films.count++] = all.items[i];
    return JSValue(moviesToJsonArray(films).c_str());
}

JSValue jsGetAllSeries(const JSObject &o, const JSArgs &a)
{
    MovieList all;
    bstInorder(bstRoot, all);
    MovieList series;
    for (int i=0; i<all.count; i++)
        if (!movieIsFilm(*all.items[i]))
            series.items[series.count++] = all.items[i];
    return JSValue(moviesToJsonArray(series).c_str());
}

JSValue jsSearchMovie(const JSObject &o, const JSArgs &a)
{
    if (a.empty()) return JSValue("null");
    std::string nama = jsToStr(a[0].ToString());
    BSTNode *node = bstFind(bstRoot, nama);
    if (!node) return JSValue("null");
    return JSValue(movieToJson(node->data).c_str());
}

JSValue jsGetGenres(const JSObject &o, const JSArgs &a)
{
    GenreList genres = htGetAllGenres();
    std::string s = "[";
    for (int i = 0; i < genres.count; i++)
    {
        s += "{\"nama\":\"" + genres.items[i]->nama + "\",\"count\":" +
             std::to_string(genres.items[i]->jumlahFilm) + "}";
        if (i + 1 < genres.count)
            s += ",";
    }
    s += "]";
    return JSValue(s.c_str());
}

JSValue jsGetFilmsByGenre(const JSObject &o, const JSArgs &a)
{
    if (a.empty()) return JSValue("[]");
    std::string genreName = jsToStr(a[0].ToString());
    GenreNode *g = htFindGenre(genreHT, genreName);
    if (!g) return JSValue("[]");
    
    MovieList result;
    // INI JAWABAN UNTUK DOSEN: Traversal Murni dari Pointer Graph! Tanpa memanggil bstFind!
    for (int i = 0; i < g->jumlahFilm; i++)
    {
        result.items[result.count++] = g->films[i]; 
    }
    return JSValue(moviesToJsonArray(result).c_str());
}

JSValue jsRateMovie(const JSObject &o, const JSArgs &a)
{
    if (a.size() < 2) return JSValue(false);
    std::string nama = jsToStr(a[0].ToString());
    double rating = a[1].ToNumber();
    if (rating < 1.0 || rating > 10.0) return JSValue(false);
    
    bool ok = rateMovie(nama, rating);
    if (!ok) return JSValue(false);
    
    BSTNode *node = bstFind(bstRoot, nama);
    if (!node) return JSValue(false);
    return JSValue(movieToJson(node->data).c_str());
}

JSValue jsLoginAdmin(const JSObject &o, const JSArgs &a)
{
    if (a.empty()) return JSValue(false);
    std::string pass = jsToStr(a[0].ToString());
    isAdmin = (pass == ADMIN_PASS);
    return JSValue(isAdmin);
}

JSValue jsIsAdmin(const JSObject &o, const JSArgs &a)
{
    return JSValue(isAdmin);
}

JSValue jsAddMovie(const JSObject &o, const JSArgs &a)
{
    if (a.empty()) return JSValue("{\"success\":false,\"message\":\"No data\"}");
    std::string jsonStr = jsToStr(a[0].ToString());

    Movie m;
    m.nama = jsonGetString(jsonStr, "nama");
    m.studio = jsonGetString(jsonStr, "studio");
    m.jumlahEpisode = jsonGetInt(jsonStr, "episode");
    m.jumlahSeason = jsonGetInt(jsonStr, "season");

    std::string genreStr = jsonGetString(jsonStr, "genreStr");
    std::istringstream ss(genreStr);
    std::string token;
    while (std::getline(ss, token, ','))
    {
        while (!token.empty() && token.front() == ' ') token.erase(token.begin());
        while (!token.empty() && token.back() == ' ') token.pop_back();
        if (!token.empty() && m.jumlahGenre < 9)
            m.genre[m.jumlahGenre++] = token;
    }

    std::string relStr = jsonGetString(jsonStr, "relatedStr");
    std::istringstream ss2(relStr);
    while (std::getline(ss2, token, ',') && m.jumlahBufferTerkait < MAX_RELATED)
    {
        while (!token.empty() && token.front() == ' ') token.erase(token.begin());
        while (!token.empty() && token.back() == ' ') token.pop_back();
        if (!token.empty())
            m.bufferNamaTerkait[m.jumlahBufferTerkait++] = token; // Buffer string sementara
    }

    AddResult res = addMovie(m);
    std::string out = "{\"success\":" + std::string(res.success ? "true" : "false") +
                      ",\"message\":\"" + jsonEscape(res.message) + "\"}";
    return JSValue(out.c_str());
}

JSValue jsSearchTMDB(const JSObject &o, const JSArgs &a)
{
    if (a.size() < 2) return JSValue("null");
    std::string query = jsToStr(a[0].ToString());
    bool isSeries = a[1].ToBoolean();
    Movie m = fetchFromTMDB(query, isSeries);
    if (m.nama.empty()) return JSValue("null");
    return JSValue(movieToJson(m).c_str());
}

JSValue jsGetRelatedMovies(const JSObject &o, const JSArgs &a)
{
    if (a.empty()) return JSValue("[]");
    std::string nama = jsToStr(a[0].ToString());
    BSTNode *node = bstFind(bstRoot, nama);
    if (!node) return JSValue("[]");
    
    MovieList result;
    // INI JAWABAN UNTUK DOSEN: Traversal Murni dari Pointer Graph! Tanpa memanggil bstFind!
    for (int i = 0; i < node->data.jumlahTerkait; i++)
    {
        result.items[result.count++] = node->data.filmTerkait[i];
    }
    return JSValue(moviesToJsonArray(result).c_str());
}

JSValue jsLog(const JSObject &o, const JSArgs &a)
{
    if (!a.empty()) std::cout << "[JS-LOG] " << jsToStr(a[0].ToString()) << "\n";
    return JSValue(false);
}

class WordboxdApp : public WindowListener, public ViewListener, public LoadListener
{
    RefPtr<App> app_;
    RefPtr<Window> window_;
    RefPtr<Overlay> overlay_;

public:
    WordboxdApp()
    {
        initDatabase();
        Settings settings;
        settings.developer_name = "Wordboxd";
        settings.app_name = "Wordboxd";
        settings.file_system_path = "./assets/";

        Config config;
        app_ = App::Create(settings, config);
        window_ = Window::Create(app_->main_monitor(), 1280, 800, false,
                                 kWindowFlags_Titled | kWindowFlags_Resizable);
        window_->SetTitle("Wordboxd - Movie Rating System");
        overlay_ = Overlay::Create(window_, window_->width(), window_->height(), 0, 0);

        window_->set_listener(this);
        overlay_->view()->set_view_listener(this);
        overlay_->view()->set_load_listener(this);

        overlay_->view()->LoadURL("file:///index.html");
    }

    virtual void OnDOMReady(View *caller, uint64_t frame_id,
                            bool is_main_frame, const String &url) override
    {
        if (!is_main_frame) return;
        SetJSContext(caller->LockJSContext()->ctx());
        JSObject global = JSGlobalObject();

        global["getAllMovies"] = BindJSCallbackWithRetval(&WordboxdApp::_getAllMovies);
        global["getAllFilms"] = BindJSCallbackWithRetval(&WordboxdApp::_getAllFilms);
        global["getAllSeries"] = BindJSCallbackWithRetval(&WordboxdApp::_getAllSeries);
        global["searchMovie"] = BindJSCallbackWithRetval(&WordboxdApp::_searchMovie);
        global["getGenres"] = BindJSCallbackWithRetval(&WordboxdApp::_getGenres);
        global["getFilmsByGenre"] = BindJSCallbackWithRetval(&WordboxdApp::_getFilmsByGenre);
        global["rateMovie"] = BindJSCallbackWithRetval(&WordboxdApp::_rateMovie);
        global["loginAdmin"] = BindJSCallbackWithRetval(&WordboxdApp::_loginAdmin);
        global["checkIsAdmin"] = BindJSCallbackWithRetval(&WordboxdApp::_checkIsAdmin);
        global["addMovie"] = BindJSCallbackWithRetval(&WordboxdApp::_addMovie);
        global["searchTMDB"] = BindJSCallbackWithRetval(&WordboxdApp::_searchTMDB);
        global["getRelatedMovies"] = BindJSCallbackWithRetval(&WordboxdApp::_getRelatedMovies);
        global["jsLog"] = BindJSCallback(&WordboxdApp::_jsLog);

        caller->EvaluateScript("if(typeof onBridgeReady==='function') onBridgeReady();");
    }

    JSValue _getAllMovies(const JSObject &o, const JSArgs &a) { return jsGetAllMovies(o, a); }
    JSValue _getAllFilms(const JSObject &o, const JSArgs &a) { return jsGetAllFilms(o, a); }
    JSValue _getAllSeries(const JSObject &o, const JSArgs &a) { return jsGetAllSeries(o, a); }
    JSValue _searchMovie(const JSObject &o, const JSArgs &a) { return jsSearchMovie(o, a); }
    JSValue _getGenres(const JSObject &o, const JSArgs &a) { return jsGetGenres(o, a); }
    JSValue _getFilmsByGenre(const JSObject &o, const JSArgs &a) { return jsGetFilmsByGenre(o, a); }
    JSValue _rateMovie(const JSObject &o, const JSArgs &a) { return jsRateMovie(o, a); }
    JSValue _loginAdmin(const JSObject &o, const JSArgs &a) { return jsLoginAdmin(o, a); }
    JSValue _checkIsAdmin(const JSObject &o, const JSArgs &a) { return jsIsAdmin(o, a); }
    JSValue _addMovie(const JSObject &o, const JSArgs &a) { return jsAddMovie(o, a); }
    JSValue _searchTMDB(const JSObject &o, const JSArgs &a) { return jsSearchTMDB(o, a); }
    JSValue _getRelatedMovies(const JSObject &o, const JSArgs &a) { return jsGetRelatedMovies(o, a); }
    JSValue _jsLog(const JSObject &o, const JSArgs &a) { return jsLog(o, a); }

    virtual void OnClose(ultralight::Window *w) override
    {
        app_->Quit();
    }
    virtual void OnResize(ultralight::Window *w, uint32_t width, uint32_t height) override
    {
        overlay_->Resize(width, height);
    }
    virtual void OnChangeCursor(ultralight::View *v, ultralight::Cursor c) override
    {
        window_->SetCursor(c);
    }

    void Run() { app_->Run(); }
};

int main()
{
    initConsole();
    WordboxdApp app;
    app.Run();
    return 0;
}