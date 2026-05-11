#pragma once
#include <iostream>
#include <string>
#include <fstream>
#include <windows.h>
#include <wininet.h>
#pragma comment(lib, "wininet.lib")

constexpr int MAX_RELATED = 73;
constexpr int HT_SIZE = 31;

const std::string ADMIN_PASS = "akuadmin727";
const std::string DATA_FILE = "wordboxd_data.json";
const std::string TMDB_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const std::string TMDB_BASE = "https://api.themoviedb.org/3";
const std::string TMDB_IMG = "https://image.tmdb.org/t/p/w500";

struct Movie
{
    std::string nama;
    std::string genre[9];
    int jumlahGenre = 0;

    int jumlahEpisode = 0;
    int jumlahSeason = 0;

    std::string studio;
    std::string overview;
    std::string posterUrl;
    int year = 0;

    double rating = 0.0;
    int totalRating = 0;

    // GRAPH
    // Menyimpan POINTER langsung ke node film lain (Edge)
    Movie *filmTerkait[MAX_RELATED];
    int jumlahTerkait = 0;

    // Buffer sementara untuk menyimpan teks dari input admin/JSON sebelum dikaitkan ke Pointer
    std::string bufferNamaTerkait[MAX_RELATED];
    int jumlahBufferTerkait = 0;
};

struct BSTNode
{
    Movie data;
    BSTNode *left = nullptr;
    BSTNode *right = nullptr;
};

struct GenreNode
{
    std::string nama;
    // Menyimpan POINTER langsung ke memori film
    Movie *films[500];
    int jumlahFilm = 0;
};

struct HashTable
{
    GenreNode *table[HT_SIZE] = {};
};

struct MovieList
{
    Movie *items[2000];
    int count = 0;
};

struct StringList
{
    std::string items[100];
    int count = 0;
};

struct GenreList
{
    GenreNode *items[HT_SIZE];
    int count = 0;
};

//  STATE DATABASE GLOBAL
BSTNode *bstRoot = nullptr;
HashTable genreHT;
bool isAdmin = false;

const char *VALID_GENRES[] = {
    "Action", "Animated", "Documentary", "Drama",
    "History", "Horror", "Musical", "Mystery", "War"};
const int GENRE_COUNT = 9;

std::string toLower(std::string text)
{
    for (size_t i = 0; i < text.length(); i++)
    {
        if (text[i] >= 'A' && text[i] <= 'Z')
            text[i] = text[i] + 32;
    }
    return text;
}

std::string httpGet(const std::string &url)
{
    HINTERNET internetHandle = InternetOpenA("Wordboxd/1.0", INTERNET_OPEN_TYPE_DIRECT, NULL, NULL, 0);
    if (!internetHandle)
        return "";

    HINTERNET urlHandle = InternetOpenUrlA(internetHandle, url.c_str(), NULL, 0, INTERNET_FLAG_RELOAD | INTERNET_FLAG_SECURE, 0);
    if (!urlHandle)
    {
        InternetCloseHandle(internetHandle);
        return "";
    }

    std::string result;
    char buffer[8192];
    DWORD bytesRead;

    while (InternetReadFile(urlHandle, buffer, sizeof(buffer) - 1, &bytesRead) && bytesRead > 0)
    {
        buffer[bytesRead] = '\0';
        result += buffer;
    }

    InternetCloseHandle(urlHandle);
    InternetCloseHandle(internetHandle);
    
    return result;
}

// JSON PARSER
std::string jsonEscape(const std::string &text)
{
    std::string output;
    for (char c : text)
    {
        if (c == '"')
            output += "\\\"";
        else if (c == '\\')
            output += "\\\\";
        else if (c == '\n')
            output += "\\n";
        else
            output += c;
    }
    return output;
}

std::string jsonGetString(const std::string &jsonText, const std::string &key)
{
    std::string searchKey = "\"" + key + "\"";
    size_t cursor = jsonText.find(searchKey);
    if (cursor == std::string::npos)
        return "";

    cursor = jsonText.find(':', cursor) + 1;
    while (cursor < jsonText.size() && (jsonText[cursor] == ' ' || jsonText[cursor] == '\t'))
        cursor++;
    if (cursor >= jsonText.size())
        return "";

    if (jsonText[cursor] == '"')
    {
        cursor++;
        std::string extractedValue;
        while (cursor < jsonText.size() && jsonText[cursor] != '"')
        {
            if (jsonText[cursor] == '\\')
            {
                cursor++;
                if (cursor < jsonText.size())
                    extractedValue += jsonText[cursor];
            }
            else
            {
                extractedValue += jsonText[cursor];
            }
            cursor++;
        }
        return extractedValue;
    }

    size_t endCursor = jsonText.find_first_of(",}\n", cursor);
    std::string extractedValue = jsonText.substr(cursor, endCursor - cursor);

    while (!extractedValue.empty() && (extractedValue.back() == ' ' || extractedValue.back() == '\t'))
    {
        extractedValue.pop_back();
    }
    return extractedValue;
}

double jsonGetDouble(const std::string &jsonText, const std::string &key)
{
    std::string valueStr = jsonGetString(jsonText, key);
    if (valueStr.empty())
        return 0.0;
    try
    {
        return std::stod(valueStr);
    }
    catch (...)
    {
        return 0.0;
    }
}

int jsonGetInt(const std::string &jsonText, const std::string &key)
{
    std::string valueStr = jsonGetString(jsonText, key);
    if (valueStr.empty())
        return 0;
    try
    {
        return std::stoi(valueStr);
    }
    catch (...)
    {
        return 0;
    }
}

// HASH TABLE GENRE
int hashFunc(const std::string &text)
{
    int hashValue = 0;
    for (size_t i = 0; i < text.length(); i++)
    {
        char lowerChar = text[i];
        if (lowerChar >= 'A' && lowerChar <= 'Z')
            lowerChar += 32;
        hashValue = (hashValue * 31 + lowerChar) % HT_SIZE;
    }
    return hashValue;
}

void htInsertGenre(HashTable &ht, const std::string &namaGenre)
{
    int index = hashFunc(namaGenre);
    while (ht.table[index] != nullptr)
    {
        index = (index + 1) % HT_SIZE;
    }
    ht.table[index] = new GenreNode();
    ht.table[index]->nama = namaGenre;
}

GenreNode *htFindGenre(HashTable &ht, const std::string &namaGenre)
{
    int index = hashFunc(namaGenre);
    int startIndex = index;

    while (ht.table[index] != nullptr)
    {
        if (toLower(ht.table[index]->nama) == toLower(namaGenre))
        {
            return ht.table[index];
        }
        index = (index + 1) % HT_SIZE;
        if (index == startIndex)
            break;
    }
    return nullptr;
}

bool htIsValidGenre(HashTable &ht, const std::string &namaGenre)
{
    return htFindGenre(ht, namaGenre) != nullptr;
}

// UPDATE: Sekarang menerima Pointer Movie langsung (Graph Murni)
void htAddFilmToGenre(HashTable &ht, const std::string &namaGenre, Movie *moviePtr)
{
    GenreNode *genreNode = htFindGenre(ht, namaGenre);
    if (!genreNode)
        return;

    // Cek duplikasi pointer
    for (int i = 0; i < genreNode->jumlahFilm; i++)
    {
        if (genreNode->films[i] == moviePtr)
            return;
    }

    if (genreNode->jumlahFilm < 500)
    {
        genreNode->films[genreNode->jumlahFilm++] = moviePtr;
    }
}

void initGenreHT()
{
    for (int i = 0; i < GENRE_COUNT; i++)
    {
        htInsertGenre(genreHT, VALID_GENRES[i]);
    }
}

GenreList htGetAllGenres()
{
    GenreList resultList;
    for (int i = 0; i < HT_SIZE; i++)
    {
        if (genreHT.table[i])
        {
            resultList.items[resultList.count++] = genreHT.table[i];
        }
    }

    for (int i = 0; i < resultList.count - 1; i++)
    {
        for (int j = 0; j < resultList.count - i - 1; j++)
        {
            if (resultList.items[j]->nama > resultList.items[j + 1]->nama)
            {
                GenreNode *temp = resultList.items[j];
                resultList.items[j] = resultList.items[j + 1];
                resultList.items[j + 1] = temp;
            }
        }
    }
    return resultList;
}

// OPERASI BINARY SEARCH TREE (BST)
BSTNode *bstInsert(BSTNode *node, const Movie &newMovie, bool &isInserted)
{
    if (node == nullptr)
    {
        BSTNode *newNode = new BSTNode();
        newNode->data = newMovie;
        newNode->left = nullptr;
        newNode->right = nullptr;
        isInserted = true;
        return newNode;
    }

    std::string namaBaruLower = toLower(newMovie.nama);
    std::string namaNodeLower = toLower(node->data.nama);

    if (namaBaruLower < namaNodeLower)
    {
        node->left = bstInsert(node->left, newMovie, isInserted);
    }
    else if (namaBaruLower > namaNodeLower)
    {
        node->right = bstInsert(node->right, newMovie, isInserted);
    }
    else
    {
        isInserted = false;
    }
    return node;
}

BSTNode *bstFind(BSTNode *node, const std::string &namaTarget)
{
    if (node == nullptr)
        return nullptr;

    std::string targetLower = toLower(namaTarget);
    std::string currentLower = toLower(node->data.nama);

    if (targetLower == currentLower)
        return node;
    if (targetLower < currentLower)
        return bstFind(node->left, namaTarget);
    return bstFind(node->right, namaTarget);
}

void bstInorder(BSTNode *node, MovieList &resultList)
{
    if (node == nullptr)
        return;
    bstInorder(node->left, resultList);

    if (resultList.count < 2000)
    {
        resultList.items[resultList.count++] = &node->data;
    }

    bstInorder(node->right, resultList);
}

// HELPER KHUSUS MOVIE
bool movieIsFilm(const Movie &movieData)
{
    return movieData.jumlahEpisode == 0 && movieData.jumlahSeason == 0;
}

void movieAddRating(Movie *movieData, double ratingBaru)
{
    double totalNilai = movieData->rating * movieData->totalRating + ratingBaru;
    movieData->totalRating++;

    double newRating = totalNilai / movieData->totalRating;
    double dikaliSepuluh = newRating * 10.0;
    movieData->rating = (double)((int)(dikaliSepuluh + 0.5)) / 10.0;
}

// UPDATE: Menggunakan perbandingan Pointer untuk Graf
bool movieAddRelated(Movie *movieA, Movie *movieB)
{
    if (movieA->jumlahTerkait >= MAX_RELATED)
        return false;
    for (int i = 0; i < movieA->jumlahTerkait; i++)
    {
        if (movieA->filmTerkait[i] == movieB)
            return false;
    }
    movieA->filmTerkait[movieA->jumlahTerkait++] = movieB;
    return true;
}

// JSON UNTUK REACT
std::string movieToJson(const Movie &m)
{
    std::string s = "{";
    s += "\"nama\":\"" + jsonEscape(m.nama) + "\",";
    s += "\"studio\":\"" + jsonEscape(m.studio) + "\",";
    s += "\"overview\":\"" + jsonEscape(m.overview) + "\",";
    s += "\"poster\":\"" + jsonEscape(m.posterUrl) + "\",";
    s += "\"year\":" + std::to_string(m.year) + ",";
    s += "\"episode\":" + std::to_string(m.jumlahEpisode) + ",";
    s += "\"season\":" + std::to_string(m.jumlahSeason) + ",";
    s += "\"rating\":" + std::to_string(m.rating) + ",";
    s += "\"totalRating\":" + std::to_string(m.totalRating) + ",";
    s += "\"isFilm\":" + std::string(movieIsFilm(m) ? "true" : "false") + ",";

    s += "\"genre\":[";
    for (int i = 0; i < m.jumlahGenre; i++)
    {
        s += "\"" + jsonEscape(m.genre[i]) + "\"";
        if (i + 1 < m.jumlahGenre)
            s += ",";
    }
    s += "],";

    s += "\"related\":[";
    for (int i = 0; i < m.jumlahTerkait; i++)
    {
        // Karena sekarang Pointer, kita ambil attribute ->nama nya
        s += "\"" + jsonEscape(m.filmTerkait[i]->nama) + "\"";
        if (i + 1 < m.jumlahTerkait)
            s += ",";
    }
    s += "]}";
    return s;
}

std::string moviesToJsonArray(const MovieList &moviesList)
{
    std::string s = "[";
    for (int i = 0; i < moviesList.count; i++)
    {
        s += movieToJson(*moviesList.items[i]);
        if (i + 1 < moviesList.count)
            s += ",";
    }
    s += "]";
    return s;
}

// SAVE & LOAD
void saveToFile()
{
    std::ofstream file(DATA_FILE);
    if (!file)
        return;

    MovieList movies;
    bstInorder(bstRoot, movies);

    file << "[\n";
    for (int i = 0; i < movies.count; i++)
    {
        Movie *m = movies.items[i];
        file << "  {\n";
        file << "    \"nama\":\"" << jsonEscape(m->nama) << "\",\n";
        file << "    \"studio\":\"" << jsonEscape(m->studio) << "\",\n";
        file << "    \"overview\":\"" << jsonEscape(m->overview) << "\",\n";
        file << "    \"poster\":\"" << jsonEscape(m->posterUrl) << "\",\n";
        file << "    \"year\":" << m->year << ",\n";
        file << "    \"episode\":" << m->jumlahEpisode << ",\n";
        file << "    \"season\":" << m->jumlahSeason << ",\n";
        file << "    \"rating\":" << m->rating << ",\n";
        file << "    \"totalRating\":" << m->totalRating << ",\n";

        file << "    \"genre\":[";
        for (int j = 0; j < m->jumlahGenre; j++)
        {
            file << "\"" << jsonEscape(m->genre[j]) << "\"";
            if (j + 1 < m->jumlahGenre)
                file << ",";
        }
        file << "],\n";

        file << "    \"related\":[";
        for (int j = 0; j < m->jumlahTerkait; j++)
        {
            file << "\"" << jsonEscape(m->filmTerkait[j]->nama) << "\""; // Dari pointer
            if (j + 1 < m->jumlahTerkait)
                file << ",";
        }
        file << "]\n  }";
        if (i + 1 < movies.count)
            file << ",";
        file << "\n";
    }
    file << "]\n";
}

void loadFromFile()
{
    std::ifstream file(DATA_FILE);
    if (!file)
        return;

    std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
    size_t cursor = 0;

    while ((cursor = content.find('{', cursor)) != std::string::npos)
    {
        size_t endCursor = content.find('}', cursor);
        if (endCursor == std::string::npos)
            break;

        std::string jsonObject = content.substr(cursor, endCursor - cursor + 1);
        Movie m;

        m.nama = jsonGetString(jsonObject, "nama");
        m.studio = jsonGetString(jsonObject, "studio");
        m.overview = jsonGetString(jsonObject, "overview");
        m.posterUrl = jsonGetString(jsonObject, "poster");
        m.year = jsonGetInt(jsonObject, "year");
        m.jumlahEpisode = jsonGetInt(jsonObject, "episode");
        m.jumlahSeason = jsonGetInt(jsonObject, "season");
        m.rating = jsonGetDouble(jsonObject, "rating");
        m.totalRating = jsonGetInt(jsonObject, "totalRating");

        size_t genreStart = jsonObject.find("\"genre\"");
        if (genreStart != std::string::npos)
        {
            size_t arrOpen = jsonObject.find('[', genreStart);
            size_t arrClose = jsonObject.find(']', arrOpen);
            if (arrOpen != std::string::npos && arrClose != std::string::npos)
            {
                std::string arrContent = jsonObject.substr(arrOpen + 1, arrClose - arrOpen - 1);
                size_t quoteStart = 0;
                while ((quoteStart = arrContent.find('"', quoteStart)) != std::string::npos && m.jumlahGenre < 9)
                {
                    size_t quoteEnd = arrContent.find('"', quoteStart + 1);
                    if (quoteEnd == std::string::npos)
                        break;
                    m.genre[m.jumlahGenre++] = arrContent.substr(quoteStart + 1, quoteEnd - quoteStart - 1);
                    quoteStart = quoteEnd + 1;
                }
            }
        }

        size_t relatedStart = jsonObject.find("\"related\"");
        if (relatedStart != std::string::npos)
        {
            size_t arrOpen = jsonObject.find('[', relatedStart);
            size_t arrClose = jsonObject.find(']', arrOpen);
            if (arrOpen != std::string::npos && arrClose != std::string::npos)
            {
                std::string arrContent = jsonObject.substr(arrOpen + 1, arrClose - arrOpen - 1);
                size_t quoteStart = 0;
                while ((quoteStart = arrContent.find('"', quoteStart)) != std::string::npos && m.jumlahBufferTerkait < MAX_RELATED)
                {
                    size_t quoteEnd = arrContent.find('"', quoteStart + 1);
                    if (quoteEnd == std::string::npos)
                        break;
                    // Simpan nama di buffer dulu
                    m.bufferNamaTerkait[m.jumlahBufferTerkait++] = arrContent.substr(quoteStart + 1, quoteEnd - quoteStart - 1);
                    quoteStart = quoteEnd + 1;
                }
            }
        }

        if (!m.nama.empty())
        {
            bool isInserted = false;
            bstRoot = bstInsert(bstRoot, m, isInserted);
        }
        cursor = endCursor + 1;
    }

    // Menghubungkan Pointer Graf (Universe dan Genre) setelah BST penuh
    MovieList allMovies;
    bstInorder(bstRoot, allMovies);

    for (int i = 0; i < allMovies.count; i++)
    {
        Movie *currentMovie = allMovies.items[i];

        // Hubungkan Edge ke Hash Table Genre
        for (int j = 0; j < currentMovie->jumlahGenre; j++)
        {
            htAddFilmToGenre(genreHT, currentMovie->genre[j], currentMovie);
        }

        // Hubungkan Edge antar Film (Cinematic Universe)
        currentMovie->jumlahTerkait = 0;
        for (int j = 0; j < currentMovie->jumlahBufferTerkait; j++)
        {
            BSTNode *relNode = bstFind(bstRoot, currentMovie->bufferNamaTerkait[j]);
            if (relNode)
            {
                currentMovie->filmTerkait[currentMovie->jumlahTerkait++] = &relNode->data;
            }
        }
    }
}

// API INTERACTION
Movie fetchFromTMDB(const std::string &query, bool isSeries)
{
    Movie m;
    std::string encodedQuery;
    for (size_t i = 0; i < query.length(); i++)
    {
        if (query[i] == ' ')
            encodedQuery += "%20";
        else
            encodedQuery += query[i];
    }

    std::string searchType = isSeries ? "tv" : "movie";
    std::string url = TMDB_BASE + "/search/" + searchType + "?api_key=" + TMDB_KEY + "&query=" + encodedQuery;

    std::string response = httpGet(url);
    if (response.empty())
        return m;

    size_t resultsPos = response.find("\"results\"");
    if (resultsPos == std::string::npos)
        return m;

    size_t arrayStart = response.find('[', resultsPos);
    if (arrayStart == std::string::npos)
        return m;

    size_t objStart = response.find('{', arrayStart);
    if (objStart == std::string::npos)
        return m;

    int depth = 0;
    size_t objEnd = objStart;
    while (objEnd < response.size())
    {
        if (response[objEnd] == '{')
            depth++;
        else if (response[objEnd] == '}')
        {
            depth--;
            if (depth == 0)
                break;
        }
        objEnd++;
    }
    std::string jsonObject = response.substr(objStart, objEnd - objStart + 1);

    if (isSeries)
    {
        m.nama = jsonGetString(jsonObject, "name");
        if (m.nama.empty())
            m.nama = jsonGetString(jsonObject, "original_name");

        std::string dateStr = jsonGetString(jsonObject, "first_air_date");
        if (dateStr.size() >= 4)
            try
            {
                m.year = std::stoi(dateStr.substr(0, 4));
            }
            catch (...)
            {
            }

        m.jumlahSeason = 1;
        m.jumlahEpisode = 10;
    }
    else
    {
        m.nama = jsonGetString(jsonObject, "title");
        if (m.nama.empty())
            m.nama = jsonGetString(jsonObject, "original_title");

        std::string dateStr = jsonGetString(jsonObject, "release_date");
        if (dateStr.size() >= 4)
            try
            {
                m.year = std::stoi(dateStr.substr(0, 4));
            }
            catch (...)
            {
            }
    }

    m.overview = jsonGetString(jsonObject, "overview");
    m.rating = jsonGetDouble(jsonObject, "vote_average");
    m.totalRating = jsonGetInt(jsonObject, "vote_count");

    std::string posterPath = jsonGetString(jsonObject, "poster_path");
    if (!posterPath.empty())
    {
        if (posterPath[0] == '/')
            posterPath = TMDB_IMG + posterPath;
        m.posterUrl = posterPath;
    }

    std::cout << "[TMDB] Fetched: '" << m.nama << "' (" << m.year << ") rating=" << m.rating << "\n";
    std::cout.flush();
    return m;
}

struct SeedData
{
    const char *query;
    const char *genres[4];
    bool isSeries;
};

void seedDatabase()
{
    SeedData seedList[] = {
        // MOVIES
        {"Oppenheimer", {"History", "Drama", "Action", nullptr}, false},
        {"Interstellar", {"Action", "Drama", nullptr, nullptr}, false},
        {"The Dark Knight", {"Action", "Drama", "Mystery", nullptr}, false},
        {"Dunkirk", {"War", "Action", "Drama", nullptr}, false},
        {"Avengers Endgame", {"Action", nullptr, nullptr, nullptr}, false},
        {"Spider-Man No Way Home", {"Action", nullptr, nullptr, nullptr}, false},
        {"Deadpool & Wolverine", {"Action", nullptr, nullptr, nullptr}, false},
        {"Inception", {"Action", "Mystery", nullptr, nullptr}, false},
        {"Joker", {"Drama", "Mystery", nullptr, nullptr}, false},
        {"Parasite", {"Drama", "Mystery", nullptr, nullptr}, false},
        {"1917", {"War", "History", "Drama", nullptr}, false},
        {"Schindler's List", {"History", "Drama", "War", nullptr}, false},
        {"Saving Private Ryan", {"War", "Drama", "History", nullptr}, false},
        {"The Lion King", {"Animated", "Musical", "Drama", nullptr}, false},
        {"Toy Story", {"Animated", nullptr, nullptr, nullptr}, false},
        {"Spirited Away", {"Animated", "Drama", nullptr, nullptr}, false},
        {"The Conjuring", {"Horror", "Mystery", nullptr, nullptr}, false},
        {"Hereditary", {"Horror", "Mystery", "Drama", nullptr}, false},
        {"A Quiet Place", {"Horror", "Drama", nullptr, nullptr}, false},
        {"The Godfather", {"Drama", nullptr, nullptr, nullptr}, false},
        {"Pulp Fiction", {"Drama", nullptr, nullptr, nullptr}, false},
        {"Gladiator", {"Action", "History", "Drama", nullptr}, false},
        {"Braveheart", {"History", "War", "Drama", nullptr}, false},
        {"La La Land", {"Musical", "Drama", nullptr, nullptr}, false},
        {"The Sound of Music", {"Musical", "Drama", "History", nullptr}, false},
        {"Hamilton", {"Musical", "History", "Drama", nullptr}, false},
        {"Bohemian Rhapsody", {"Musical", "Drama", "History", nullptr}, false},
        {"The Prestige", {"Mystery", "Drama", nullptr, nullptr}, false},
        {"Memento", {"Mystery", "Drama", nullptr, nullptr}, false},
        {"Shutter Island", {"Mystery", "Horror", "Drama", nullptr}, false},
        {"Apollo 11", {"Documentary", "History", nullptr, nullptr}, false},
        {"Planet Earth", {"Documentary", nullptr, nullptr, nullptr}, false},
        {"Our Planet", {"Documentary", nullptr, nullptr, nullptr}, false},
        {"Hacksaw Ridge", {"War", "History", "Drama", nullptr}, false},
        {"Black Hawk Down", {"War", "Action", "History", nullptr}, false},

        // SERIES
        {"Breaking Bad", {"Drama", "Mystery", nullptr, nullptr}, true},
        {"Game of Thrones", {"Action", "Drama", nullptr, nullptr}, true},
        {"Stranger Things", {"Horror", "Mystery", "Drama", nullptr}, true},
        {"The Last of Us", {"Horror", "Drama", "Action", nullptr}, true},
        {"Band of Brothers", {"War", "History", "Drama", nullptr}, true},
        {"Chernobyl", {"History", "Drama", nullptr, nullptr}, true},
        {"Arcane", {"Animated", "Action", "Drama", nullptr}, true},
        {"Attack on Titan", {"Animated", "Action", "War", nullptr}, true},
        {"Sherlock", {"Mystery", "Drama", nullptr, nullptr}, true},
        {"Mindhunter", {"Mystery", "Drama", "History", nullptr}, true},
        {"Succession", {"Drama", nullptr, nullptr, nullptr}, true},
        {"Better Call Saul", {"Drama", "Mystery", nullptr, nullptr}, true},
        {"Narcos", {"Drama", "History", nullptr, nullptr}, true},
        {"The Crown", {"History", "Drama", nullptr, nullptr}, true},
        {"Our World War", {"War", "History", "Documentary", nullptr}, true}};
    int totalSeeds = sizeof(seedList) / sizeof(seedList[0]);

    for (int i = 0; i < totalSeeds; i++)
    {
        Movie m = fetchFromTMDB(seedList[i].query, seedList[i].isSeries);
        if (m.nama.empty())
        {
            m.nama = seedList[i].query;
            m.studio = "Unknown";
        }

        m.jumlahGenre = 0;
        for (int j = 0; j < 4 && seedList[i].genres[j]; j++)
        {
            if (htIsValidGenre(genreHT, seedList[i].genres[j]))
            {
                m.genre[m.jumlahGenre++] = seedList[i].genres[j];
            }
        }

        bool isInserted = false;
        bstRoot = bstInsert(bstRoot, m, isInserted);

        if (isInserted)
        {
            BSTNode *insertedNode = bstFind(bstRoot, m.nama);
            for (int j = 0; j < m.jumlahGenre; j++)
            {
                htAddFilmToGenre(genreHT, m.genre[j], &insertedNode->data); // Kirim pointer
            }
        }
    }

    const char *mcuUniverse[] = {"Avengers: Endgame", "Spider-Man: No Way Home", "Deadpool & Wolverine", nullptr};
    for (int i = 0; mcuUniverse[i]; i++)
    {
        BSTNode *nodeA = bstFind(bstRoot, mcuUniverse[i]);
        if (!nodeA)
            continue;
        for (int j = 0; mcuUniverse[j]; j++)
        {
            if (i == j)
                continue;
            BSTNode *nodeB = bstFind(bstRoot, mcuUniverse[j]);
            if (nodeB)
                movieAddRelated(&nodeA->data, &nodeB->data); // Menyambungkan pointer
        }
    }

    const char *nolanUniverse[] = {"Oppenheimer", "Interstellar", "The Dark Knight", "Dunkirk", nullptr};
    for (int i = 0; nolanUniverse[i]; i++)
    {
        BSTNode *nodeA = bstFind(bstRoot, nolanUniverse[i]);
        if (!nodeA)
            continue;
        for (int j = 0; nolanUniverse[j]; j++)
        {
            if (i == j)
                continue;
            BSTNode *nodeB = bstFind(bstRoot, nolanUniverse[j]);
            if (nodeB)
                movieAddRelated(&nodeA->data, &nodeB->data); // Menyambungkan pointer
        }
    }
    saveToFile();
}

struct AddResult
{
    bool success = false;
    std::string message;
};

AddResult addMovie(Movie m)
{
    if (bstFind(bstRoot, m.nama))
        return {false, m.nama + " sudah terdaftar di database."};

    StringList validGenres, invalidGenres;
    for (int i = 0; i < m.jumlahGenre; i++)
    {
        if (htIsValidGenre(genreHT, m.genre[i]))
            validGenres.items[validGenres.count++] = m.genre[i];
        else
            invalidGenres.items[invalidGenres.count++] = m.genre[i];
    }

    if (validGenres.count == 0)
        return {false, "Semua genre tidak valid. Film ditolak."};

    m.jumlahGenre = 0;
    for (int i = 0; i < validGenres.count; i++)
        m.genre[m.jumlahGenre++] = validGenres.items[i];

    StringList notFoundRelated;
    int originalRelatedCount = m.jumlahBufferTerkait;

    for (int i = 0; i < originalRelatedCount; i++)
    {
        if (m.bufferNamaTerkait[i] == m.nama)
            continue;
        if (!bstFind(bstRoot, m.bufferNamaTerkait[i]))
        {
            notFoundRelated.items[notFoundRelated.count++] = m.bufferNamaTerkait[i];
        }
    }

    bool isInserted = false;
    bstRoot = bstInsert(bstRoot, m, isInserted);

    // Sambungkan Pointer setelah node masuk Tree
    BSTNode *insertedNode = bstFind(bstRoot, m.nama);
    if (insertedNode)
    {
        for (int i = 0; i < insertedNode->data.jumlahGenre; i++)
        {
            htAddFilmToGenre(genreHT, insertedNode->data.genre[i], &insertedNode->data);
        }

        // Relasi Pointer 2 Arah (Universe)
        for (int i = 0; i < originalRelatedCount; i++)
        {
            BSTNode *relNode = bstFind(bstRoot, m.bufferNamaTerkait[i]);
            if (relNode)
            {
                movieAddRelated(&insertedNode->data, &relNode->data);
                movieAddRelated(&relNode->data, &insertedNode->data);
            }
        }
    }

    saveToFile();

    std::string reportMsg = "Film berhasil ditambahkan.";
    for (int i = 0; i < invalidGenres.count; i++)
        reportMsg += "\\nGenre " + invalidGenres.items[i] + " tidak terdaftar (diabaikan).";
    for (int i = 0; i < notFoundRelated.count; i++)
        reportMsg += "\\nFilm " + notFoundRelated.items[i] + " tidak dapat ditemukan.";

    return {true, reportMsg};
}

bool rateMovie(const std::string &namaTarget, double ratingBaru)
{
    BSTNode *movieNode = bstFind(bstRoot, namaTarget);
    if (!movieNode)
        return false;

    movieAddRating(&movieNode->data, ratingBaru);
    saveToFile();
    return true;
}

void initDatabase()
{
    initGenreHT();
    loadFromFile();

    MovieList allMovies;
    bstInorder(bstRoot, allMovies);

    if (allMovies.count == 0)
        seedDatabase();
}