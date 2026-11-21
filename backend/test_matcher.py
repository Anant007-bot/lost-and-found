from datetime import datetime
from types import SimpleNamespace as R
from app.matcher import score_pair

lost = R(category="Electronics", color="Black", brand="JBL", location="Library",
         event_time=datetime(2026, 11, 4, 10, 30), description="black jbl headphones with case")
found = R(category="Electronics", color="Black/Grey", brand="Unknown", location="Study Hall 2",
          event_time=datetime(2026, 11, 4, 11, 15), description="dark headphones")
print("Headphones (your slide example):", score_pair(lost, found))

wrong = R(category="ID Card", color=None, brand=None, location="Library",
          event_time=datetime(2026, 11, 4, 11, 0), description=None)
print("Different category:", score_pair(lost, wrong))
