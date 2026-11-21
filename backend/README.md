# Smart Campus Lost & Found: backend

    pip install -r requirements.txt
    uvicorn app.main:app --reload        # API docs at http://localhost:8000/docs
    python test_matcher.py               # try the matching engine

Use MySQL:  set DATABASE_URL=mysql+pymysql://user:password@localhost:3306/lostfound
