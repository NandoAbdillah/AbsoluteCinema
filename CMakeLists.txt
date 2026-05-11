# cmake_minimum_required(VERSION 3.10)
# project(AbsoluteCinema)

# set(CMAKE_CXX_STANDARD 17)

# set(UL_SDK_PATH "${CMAKE_CURRENT_SOURCE_DIR}/ui")

# # Ini yang kurang — kasih tau CMake di mana Platform.cmake berada
# list(APPEND CMAKE_MODULE_PATH "${UL_SDK_PATH}/samples/cmake")

# include(Common)


# add_app(AbsoluteCinema src/main.cpp)


# cmake_minimum_required(VERSION 3.10)
# project(Wordboxd)
 
# set(CMAKE_CXX_STANDARD 17)
 
# set(UL_SDK_PATH "${CMAKE_CURRENT_SOURCE_DIR}/ui")
# list(APPEND CMAKE_MODULE_PATH "${UL_SDK_PATH}/samples/cmake")
# include(Common)
 
# add_app(Wordboxd src/main.cpp)

cmake_minimum_required(VERSION 3.10)
project(Wordboxd)

set(CMAKE_CXX_STANDARD 17)

set(UL_SDK_PATH "${CMAKE_CURRENT_SOURCE_DIR}/ui")
list(APPEND CMAKE_MODULE_PATH "${UL_SDK_PATH}/samples/cmake")

# Override install dir: output ke dalam folder project, bukan C:/
set(INSTALL_DIR "${CMAKE_CURRENT_SOURCE_DIR}/dist")
set(CMAKE_INSTALL_PREFIX "${CMAKE_CURRENT_SOURCE_DIR}/dist")

include(Common)

add_app(Wordboxd src/main.cpp)
