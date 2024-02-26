import pandas as pd
import psycopg2
from selenium import webdriver
from datetime import datetime
import re
import math
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
# Connect to the PostgreSQL database
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="postgres",
    password="0000",
    database="postgres"
)

# Initialize WebDriver
driver = webdriver.Firefox()

# Define the base URLs
#base_urls = [
    "https://www.e-latts.lv/augli-un-darzeni.2.g",
    "https://www.e-latts.lv/piena-produkti-majoneze-un-olas.1.g",
    "https://www.e-latts.lv/maize-un-konditorejas-izstradajumi.3.g",
    "https://www.e-latts.lv/gala-zivis-un-gatava-kulinarija.4.g",
    "https://www.e-latts.lv/bakaleja.5.g",
    "https://www.e-latts.lv/saldeta-partika.6.g",
    "https://www.e-latts.lv/dzerieni.7.g",
    "https://www.e-latts.lv/alkoholiskie-dzerieni.531.g",
    # Add other URLs as needed
]

total_products_found_count = 0

# Get today's date in the format "YYYY-MM-DD"
today_date = datetime.now().strftime("%Y-%m-%d")

# Extract Artikuls from the PostgreSQL database
cursor = conn.cursor()
cursor.execute("SELECT \"Artikuls\", \"Nosaukums\", \"Barbora\", \"Lats\", \"Citro\", \"Rimi\" FROM web_preces_db")
columns = [desc[0] for desc in cursor.description]
df = pd.DataFrame(cursor.fetchall(), columns=columns)
cursor.close()

def is_nan_or_empty(value):
    return isinstance(value, float) and math.isnan(value)

# Lists to store found product details
found_product_names = []
found_product_prices = []
found_product_artikuls = []
found_product_dates = []

for base_url in base_urls:
    title_match = re.search(r"https://www.e-latts.lv/([^/]+)", base_url)
    title = title_match.group(1) if title_match else "Unknown"

    for page_number in range(0, 100):  # Adjusted the range to start from page 1
        url = f"{base_url}?p={page_number}"
        driver.get(url)
        price_elements = driver.find_elements("css selector", "div.-oPrice")
        if not price_elements:
            break

        scraped_product_names = [name_element.text.strip() for name_element in driver.find_elements("css selector", "a.-oTitle")]
        scraped_product_prices = [price_element.text.strip().replace('€', '') for price_element in price_elements]

        for scraped_name, scraped_price in zip(scraped_product_names, scraped_product_prices):
            scraped_name_cleaned = scraped_name.lower()

            # Iterate directly over DataFrame rows
            for index, row in df.iterrows():
                product_name_cleaned = str(row['Lats']).strip().lower()

                if not is_nan_or_empty(product_name_cleaned) and product_name_cleaned == scraped_name_cleaned:
                    # Extract only the numeric part of the price using regular expressions
                    price_match = re.search(r'(\d+\.\d+)', scraped_price)
                    if price_match:
                        found_product_names.append(scraped_name)
                        found_product_prices.append(float(price_match.group(1)))  # Convert price to float
                        found_product_artikuls.append(row['Artikuls'])  # Store the corresponding Artikuls
                        found_product_dates.append(today_date)  
                        print(f'Product found in category "{title}" on page {page_number}: {scraped_name}, Price: {price_match.group(1)}, Artikuls: {row["Artikuls"]}')
                        total_products_found_count += 1
                        break  # Break the loop after finding a match
                    else:
                        print(f'Unable to extract price for product "{scraped_name}"')

# Close the browser tab
driver.quit()

print(f'===========================================================')
print(f'Total products found: {total_products_found_count}')
print(f'===========================================================')

# Create a DataFrame for found products with Product Name, Price, and Artikuls
found_products_df = pd.DataFrame({'Product Name2': found_product_names, 'Price2': found_product_prices, 'Artikuls2': found_product_artikuls, 'Date2': found_product_dates})

# Establish a connection to the PostgreSQL database
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="postgres",
    password="0000",
    database="postgres"
)

# Define the table name where you want to insert the data
table_name = 'lats'
history_table_name = 'lats_history'

# Establish a connection to the database
cursor = conn.cursor()

try:
    # Iterate through the rows of the DataFrame and insert or update data in the database table
    for index, row in found_products_df.iterrows():
        values = tuple(row[column] for column in found_products_df.columns)

        # Check if the product exists in the main table
        check_product_query = f"SELECT * FROM {table_name} WHERE \"Artikuls2\" = CAST(%s AS text)"
        logging.debug("SQL Query: %s", check_product_query)
        logging.debug("Query Parameters: %s", (values[found_products_df.columns.get_loc('Artikuls2')],))
        cursor.execute(check_product_query, (values[found_products_df.columns.get_loc('Artikuls2')],))
        existing_data = cursor.fetchone()

        if existing_data:
            tolerance = 0.001
            # Product exists in the main table
            existing_price = existing_data[3]
            existing_price = (existing_price,) if not isinstance(existing_price, tuple) else existing_price
            existing_price_float = float(existing_price[0])
            logging.debug("existing_price: %s", existing_price_float)
            logging.debug("existing_values: %s", values[found_products_df.columns.get_loc('Price2')])

            if abs(existing_price_float - values[found_products_df.columns.get_loc('Price2')]) > tolerance:
                # Price has changed, save existing data to history
                insert_history_query = f"""
                    INSERT INTO {history_table_name} ("Artikuls2", "Product Name2", "Price2", "Date2")
                    VALUES (CAST(%s AS text), CAST(%s AS text), CAST(%s AS numeric), CAST(%s AS date))
                """
                cursor.execute(insert_history_query, existing_data[1:])
                logging.debug("prices are not SAME, inserted data in history")

                # Update the main table with the new data
                update_main_table_query = f"""
                    UPDATE {table_name}
                    SET "Price2" = %s, "Date2" = %s
                    WHERE "Artikuls2" = CAST(%s AS text)
                """
                cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('Price2')], values[found_products_df.columns.get_loc('Date2')], values[found_products_df.columns.get_loc('Artikuls2')]))

                logging.debug("Updated main table with new price for ID: %s", existing_data[0])
            else:
                
                logging.debug("prices are the same, skipping history insert for ID: %s", existing_data[0])
                update_main_table_query = f"""
                    UPDATE {table_name}
                    SET "Price2" = %s, "Date2" = %s
                    WHERE "Artikuls2" = CAST(%s AS text)
                """
                cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('Price2')], values[found_products_df.columns.get_loc('Date2')], values[found_products_df.columns.get_loc('Artikuls2')]))
        else:
            # Product not found in the main table, insert new data
            insert_query = f"""
                INSERT INTO {table_name} ({', '.join(['"' + col + '"' for col in found_products_df.columns])})
                VALUES ({', '.join(['%s' for _ in found_products_df.columns])})
            """
            cursor.execute(insert_query, values)
            logging.debug("Inserted new data into the main table for Artikuls2: %s", values[found_products_df.columns.get_loc('Artikuls2')])

    # Commit the changes and close the connection
    conn.commit()
except Exception as e:
    conn.rollback()
    logging.error("Error: %s", e)
finally:
    cursor.close()
    conn.close()

logging.info("Data overwritten in the database successfully, and relevant data saved in the history table.")

