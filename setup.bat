@echo off
echo Setting up BookLending Platform...
echo.

echo Installing backend dependencies...
cd backend
pip install -r requirements.txt

echo.
echo Setting up database...
python manage.py migrate

echo.
echo Creating sample data...
python create_sample_data.py
python create_superuser.py

echo.
echo Installing frontend dependencies...
cd ..\frontend
npm install

echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. Backend: cd backend && python manage.py runserver
echo 2. Frontend: cd frontend && npm run dev
echo.
echo Sample users: alice/password123, bob/password123, charlie/password123
echo Admin user: admin/admin123
echo.
pause