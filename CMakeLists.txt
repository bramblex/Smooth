cmake_minimum_required(VERSION 3.8)
project(Smooth)

set(CMAKE_CXX_STANDARD 14)

include_directories(deps)
include_directories(src)

file(GLOB_RECURSE SOURCE_FILES "src/*.cpp" "src/*.h")

add_executable(Smooth ${SOURCE_FILES})
