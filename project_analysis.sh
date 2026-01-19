#!/bin/bash
set -euo pipefail

PROJECT_ROOT="/home/project/authentic-kopitiam"
BACKEND_TESTS_DIR="${PROJECT_ROOT}/backend/tests"
FRONTEND_TESTS_DIR="${PROJECT_ROOT}/frontend/tests"
DOCKER_COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.yml"
MAKEFILE="${PROJECT_ROOT}/Makefile"

echo "📊 Project Analysis Report"
echo "========================="
echo

# Function to count files with error handling
count_files() {
    local dir="$1"
    local pattern="$2"
    local description="$3"
    
    if [ ! -d "$dir" ]; then
        echo "⚠️  $description: Directory not found - $dir"
        return 0
    fi
    
    # Use find with proper error handling
    local count=$(find "$dir" -name "$pattern" -type f 2>/dev/null | wc -l)
    echo "✅ $description: $count files"
    return 0
}

# Function to check file existence and grep content
check_file_content() {
    local file="$1"
    local pattern="$2"
    local description="$3"
    local exclude_pattern="${4:-}"
    
    if [ ! -f "$file" ]; then
        echo "⚠️  $description: File not found - $file"
        return 0
    fi
    
    echo "🔍 $description:"
    if [ -z "$exclude_pattern" ]; then
        grep -E "$pattern" "$file" || echo "   (No matches found)"
    else
        grep -E "$pattern" "$file" | grep -v "$exclude_pattern" || echo "   (No matches found)"
    fi
    echo
}

# 1. Count backend test files
count_files "$BACKEND_TESTS_DIR" "*.php" "Backend test files"

# 2. Count frontend test files (fix the patterns)
if [ -d "$FRONTEND_TESTS_DIR" ]; then
    echo "✅ Frontend test files:"
    echo "   - Test files (*.test.*): $(find "$FRONTEND_TESTS_DIR" -name "*.test.*" -type f 2>/dev/null | wc -l)"
    echo "   - Spec files (*.spec.*): $(find "$FRONTEND_TESTS_DIR" -name "*.spec.*" -type f 2>/dev/null | wc -l)"
else
    echo "⚠️  Frontend test files: Directory not found - $FRONTEND_TESTS_DIR"
fi
echo

# 3. Check Docker compose structure
check_file_content "$DOCKER_COMPOSE_FILE" "(postgres|redis|laravel|nextjs)" "Docker compose services" "^#"

# 4. Check Makefile commands
check_file_content "$MAKEFILE" "^(up|down|logs|shell|test|migrate):" "Makefile commands"

echo "✅✅ Analysis completed successfully ✅✅"
echo
echo "💡 Summary:"
echo "   - Backend tests are located in: $BACKEND_TESTS_DIR"
echo "   - Frontend tests are located in: $FRONTEND_TESTS_DIR" 
echo "   - Docker compose file: $DOCKER_COMPOSE_FILE"
echo "   - Makefile: $MAKEFILE"
echo
echo "🔍 Next steps for CLAUDE.md update:"
echo "   1. Update test coverage statistics based on the counts above"
echo "   2. Document Docker services structure from the compose file"
echo "   3. List available Makefile commands for developer workflow"
echo "   4. Verify test file patterns match actual project structure"
