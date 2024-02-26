import pandas as pd
from selenium import webdriver
from datetime import datetime
from selenium.webdriver.common.by import By
import re
import psycopg2
import math
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Read data from database
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="postgres",
    password="0000",
    database="postgres"
)

# Read data from the PostgreSQL database
query = "SELECT \"Artikuls\", \"Nosaukums\", \"Barbora\", \"Lats\", \"Citro\", \"Rimi\" FROM web_preces_db WHERE \"Rimi\" IS NOT NULL AND TRIM(\"Rimi\") <> ''"
cursor = conn.cursor()
cursor.execute(query)

# Fetch the data and create a DataFrame
columns = [desc[0] for desc in cursor.description]
data = cursor.fetchall()
df = pd.DataFrame(data, columns=columns)

# Close the database connection
cursor.close()
conn.close()

# Initialize WebDriver
driver = webdriver.Firefox()

# Define the base URLs
#base_urls = [
    "https://www.rimi.lv/e-veikals/lv/produkti/augli-un-darzeni/c/SH-2",
    "https://www.rimi.lv/e-veikals/lv/produkti/veganiem-un-vegetariesiem/c/SH-16",
    "https://www.rimi.lv/e-veikals/lv/produkti/gala-zivis-un-gatava-kulinarija/c/SH-6",
    "https://www.rimi.lv/e-veikals/lv/produkti/piena-produkti-un-olas/c/SH-11",
    "https://www.rimi.lv/e-veikals/lv/produkti/maize-un-konditoreja/c/SH-7",
    "https://www.rimi.lv/e-veikals/lv/produkti/saldetie-edieni/c/SH-12",
    "https://www.rimi.lv/e-veikals/lv/produkti/iepakota-partika/c/SH-4",
    "https://www.rimi.lv/e-veikals/lv/produkti/saldumi-un-uzkodas/c/SH-13",
    "https://www.rimi.lv/e-veikals/lv/produkti/dzerieni/c/SH-5",
    "https://www.rimi.lv/e-veikals/lv/produkti/alkoholiskie-dzerieni/c/SH-1",

    "https://www.rimi.lv/e-veikals/lv/produkti/skaistumkopsanai-un-higienai/c/SH-14",
]

selector1 = 'div.price-tag.card__price span'
cents_selector = 'div.price-tag.card__price div sup'

all_found_product_names = []
all_found_product_prices = []
all_found_product_artikuls = []
all_found_product_dates = []

total_products_found_count = 0

# Get today's date in the format "DD/MM/YY"
today_date = datetime.now().strftime("%d/%m/%y")


product_names_in_db = df['Rimi'].tolist()
artikuls_in_db = df['Artikuls'].tolist()

def is_nan_or_empty(value):
    return isinstance(value, float) and math.isnan(value)

# Iterate through the base URLs
for base_url in base_urls:
    title_match = re.search(r"https://www.rimi.lv/([^/]+)", base_url)
    if title_match:
        title = title_match.group(1)
    else:
        title = "Unknown"

    products_not_found = 0
    products_found_count = 0

    page_number = 1

    while True:
        url = f"{base_url}?page={page_number}"
        driver.get(url)
        elements1 = driver.find_elements(By.CSS_SELECTOR, selector1)
        cents_elements = driver.find_elements(By.CSS_SELECTOR, cents_selector)

        if not elements1 or not cents_elements:
            break

        scraped_product_names = []
        scraped_product_prices = []

        for element1, cents_element in zip(elements1, cents_elements):
            value1 = element1.text.strip()
            cents_value = cents_element.text.strip()

            # Extract whole and decimal parts
            matches1 = value1.split()

            if len(matches1) >= 1:
                whole_part = matches1[0]

                # Check if there's at least one element in cents
                if len(cents_value) >= 1:
                    decimal_part = cents_value

                    # Combine the values
                    combined_value = f"{whole_part}.{decimal_part}"
                    scraped_product_prices.append(combined_value)
                else:
                    # If cents are missing, use only the whole part
                    scraped_product_prices.append(whole_part)

        name_elements = driver.find_elements(By.CSS_SELECTOR, "div.card__details p.card__name")
        scraped_product_names.extend([name_element.text.strip() for name_element in name_elements])

        for scraped_name, scraped_price in zip(scraped_product_names, scraped_product_prices):
            scraped_name_cleaned = scraped_name.lower()
            
            # Check if the scraped name exists, and the product name is not empty or NaN
            for product_name, artikul in zip(product_names_in_db, artikuls_in_db):
                if not is_nan_or_empty(product_name):
                    product_name_cleaned = str(product_name).strip().lower()

                    if product_name_cleaned in scraped_name_cleaned:
                        all_found_product_names.append(scraped_name)
                        all_found_product_prices.append(scraped_price)
                        all_found_product_artikuls.append(artikul)  # Store the corresponding Artikuls
                        all_found_product_dates.append(today_date)
                        print(f'Product found in category "{title}" on page {page_number}: {scraped_name}, Price: {scraped_price}, Artikuls: {artikul}')
                        
                        products_found_count += 1
                        break
            
        page_number += 1  # Move the increment outside of the loop

    print(f'Products found in category "{title}": {products_found_count}')
    total_products_found_count += products_found_count

# ... (rest of the code)

driver.quit()

print(f'===========================================================')
print(f'Total products found: {total_products_found_count}')
print(f'===========================================================')

# Create a DataFrame for found products with Product Name, Price, and Artikuls
# Create a DataFrame for found products with Product Name, Price, and Artikuls
found_products_df = pd.DataFrame({
    'Product Name4': all_found_product_names,
    'Price4': all_found_product_prices,
    'Artikuls4': all_found_product_artikuls,
    'Date4': all_found_product_dates
})

# Establish a connection to the PostgreSQL database
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="postgres",
    password="0000",
    database="postgres"
)

# Define the table name where you want to insert the data
table_name = 'rimi'
history_table_name = 'rimi_history'

# Establish a connection to the database
cursor = conn.cursor()
try:
    # Iterate through the rows of the DataFrame and insert or update data in the database table
    for index, row in found_products_df.iterrows():
        values = tuple(row[column].replace(',', ',') if isinstance(row[column], str) else row[column] for column in found_products_df.columns)

        # Check if the product exists in the main table
        check_product_query = f"SELECT * FROM {table_name} WHERE \"Artikuls4\" = CAST(%s AS text)"
        logging.debug("SQL Query: %s", check_product_query)
        logging.debug("Query Parameters: %s", (values[found_products_df.columns.get_loc('Artikuls4')],))
        cursor.execute(check_product_query, (values[found_products_df.columns.get_loc('Artikuls4')],))
        existing_data = cursor.fetchone()

        if existing_data:
            # Product exists in the main table
            existing_price = existing_data[3]
            existing_price_float = float(existing_price)
            logging.debug("existing_price: %s", existing_price_float)
            logging.debug("existing_values: %s", values[found_products_df.columns.get_loc('Price4')])

            if existing_price_float != float(values[found_products_df.columns.get_loc('Price4')].replace(',', '.')):
                # Price has changed, save existing data to history
                insert_history_query = f"""
                    INSERT INTO {history_table_name} ("Artikuls4", "Product Name4", "Price4", "Date4")
                    VALUES (CAST(%s AS text), CAST(%s AS text), CAST(%s AS numeric), CAST(%s AS date))
                """
                cursor.execute(insert_history_query, existing_data[1:])
                logging.debug("Inserted data into history")

                # Update the main table with the new price and date
                update_main_table_query = f"""
                    UPDATE {table_name}
                    SET "Price4" = CAST(%s AS numeric), "Date4" = %s
                    WHERE "Artikuls4" = CAST(%s AS text)
                """
                cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('Price4')], values[found_products_df.columns.get_loc('Date4')], values[found_products_df.columns.get_loc('Artikuls4')]))

                logging.debug("Updated main table with new price and date for Artikuls4: %s", values[found_products_df.columns.get_loc('Artikuls4')])
            else:
                logging.debug("Prices are the same, skipping history insert for Artikuls4: %s", values[found_products_df.columns.get_loc('Artikuls4')])
                update_main_table_query = f"""
                    UPDATE {table_name}
                    SET "Price4" = CAST(%s AS numeric), "Date4" = %s
                    WHERE "Artikuls4" = CAST(%s AS text)
                """
                cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('Price4')], values[found_products_df.columns.get_loc('Date4')], values[found_products_df.columns.get_loc('Artikuls4')]))
        else:
            # Product not found in the main table, insert new data
            insert_query = f"""
                INSERT INTO {table_name} ({', '.join(['"' + col + '"' for col in found_products_df.columns])})
                VALUES ({', '.join(['%s' for _ in found_products_df.columns])})
            """
            cursor.execute(insert_query, values)
            logging.debug("Inserted new data into the main table for Artikuls4: %s", values[found_products_df.columns.get_loc('Artikuls4')])

    # Commit the changes and close the connection
    conn.commit()
except Exception as e:
    conn.rollback()
    logging.error("Error: %s", e)
finally:
    cursor.close()
    conn.close()

logging.info("Data overwritten in the database successfully, and relevant data saved in the history table.")

