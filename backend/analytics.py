import os
import streamlit as st
from pymongo import MongoClient
from dotenv import load_dotenv
from collections import defaultdict
from datetime import datetime

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Setup MongoDB client
client = MongoClient(MONGO_URI)
db = client["test"]

users_col = db['users']
snacks_col = db['snacks']
orders_col = db['orders']

st.set_page_config(page_title="Snack Trade Analytics", layout="wide")
st.title("🍿 Skibidi Dukaan Leaderboards")

# Utility function to safely get user name
def get_user_name(user_id):
    user = users_col.find_one({"_id": user_id})
    return user['name'] if user else "Unknown"

# Calculate user-level analytics
user_analytics = []
user_cursor = users_col.find()
for user in user_cursor:
    uid = user['_id']
    orders = list(orders_col.find({"seller": uid}))
    total_sales = sum(len(o['items']) for o in orders)
    total_earning = sum(o['totalAmount'] for o in orders)
    unique_buyers = len(set(o['buyer'] for o in orders))

    user_analytics.append({
        "Name": user['name'],
        "Email": user['email'],
        "Total Sales": total_sales,
        "Total Earnings": total_earning,
        "Completed Orders": len(orders),
        "Unique Buyers": unique_buyers,
        "Room No": user.get("roomNo", "N/A")  # Get the roomNo if it exists, else default to "N/A"
    })

# Snack-level analytics
snack_stats = defaultdict(lambda: {"Units Sold": 0, "Revenue": 0})
completed_orders = orders_col.find()

for order in completed_orders:
    for item in order['items']:
        sid = str(item['snack'])
        snack_stats[sid]["Units Sold"] += item['quantity']
        snack_stats[sid]["Revenue"] += item['price']

# Join with snack metadata
snack_data = []
for snack in snacks_col.find():
    sid = str(snack['_id'])
    stats = snack_stats.get(sid, {"Units Sold": 0, "Revenue": 0})
    snack_data.append({
        "Name": snack['name'],
        "Listed By": get_user_name(snack['enlistedBy']),
        "Price": snack['price'],
        "Units Sold": stats['Units Sold'],
        "Revenue": stats['Revenue'],
        "Created At": snack['createdAt'].strftime("%Y-%m-%d")
    })

# Create tabs for navigation
tabs = st.tabs(["🏆 Leaderboard", "👤 Seller Analytics", "🥨 Snack Analytics", ])


with tabs[1]:
    st.subheader("👤 Seller Analytics")
    st.dataframe(user_analytics, use_container_width=True)

with tabs[2]:
    st.subheader("🥨 Snack Analytics")
    st.dataframe(snack_data, use_container_width=True)


with tabs[0]:
    st.subheader("🏆 Top Seller Leaderboard")

    top_sellers = sorted(user_analytics, key=lambda x: x['Total Earnings'], reverse=True)
    leaderboard_data = top_sellers[:10]

    st.markdown("Here are the top 10 sellers based on Total Earnings:")
    
    with st.container(border=True):
        for idx, seller in enumerate(leaderboard_data, 1):
            rank_name = f"{idx}. {seller['Name'].capitalize()}"
            earnings = f"↑ ₹{seller['Total Earnings']:.2f}" if seller["Total Earnings"] > 0 else f"₹{seller["Total Earnings"]:.2f}"

            col1, col2 = st.columns([3, 1])
            with col1:
                st.markdown(
                    f"<div style='font-size: 1.25rem; font-weight: 600; padding-top: 6px; '>{rank_name}&nbsp &nbsp<span style='border:2px solid #00FFAA; border-radius: 999px; padding-left:5px;padding-right:5px;font-size: 0.95rem; font-weight: 400'>{seller['Room No']}</span></div>",
                    unsafe_allow_html=True
                )
                
            with col2:
                st.markdown(
                    f"<div style='font-size: 1.25rem; font-weight: 600; color: #00FFAA; text-align: right; padding-top: 6px'>{earnings}</div>",
                    unsafe_allow_html=True
                )
        st.html("<div padding-top:6px>...</div>")