cmake_minimum_required(VERSION 3.10)
project(AbsoluteCinema)

set(CMAKE_CXX_STANDARD 17)

# Ini yang diganti, disesuaikan dengan nama foldermu (ui)
set(ULTRALIGHT_SDK_DIR "${CMAKE_CURRENT_SOURCE_DIR}/ui")

# Include folder headers
include_directories("${ULTRALIGHT_SDK_DIR}/include")

# Tambahkan library yang mau di-link
link_directories("${ULTRALIGHT_SDK_DIR}/lib")

add_executable(AbsoluteCinema src/main.cpp)

# Link library utama Ultralight
target_link_libraries(AbsoluteCinema 
    Ultralight 
    UltralightCore 
    WebCore 
    AppCore
)