# Test Journal API Endpoints
# This script runs the Journal API tests and generates a report

# Set environment to test
$env:NODE_ENV = "test"

# Run only journal tests with coverage
Write-Host "Running Journal API tests..." -ForegroundColor Cyan
npm run test:journal

# Check if tests succeeded
if ($LASTEXITCODE -eq 0) {
    Write-Host "All Journal API tests passed!" -ForegroundColor Green
    
    # Show coverage report location
    Write-Host "Coverage report available at ./coverage/lcov-report/index.html" -ForegroundColor Yellow
    
    # Open the coverage report if desired (uncomment to enable)
    # Start-Process "./coverage/lcov-report/index.html"
} else {
    Write-Host "Some tests failed. Please check the test output for details." -ForegroundColor Red
}
