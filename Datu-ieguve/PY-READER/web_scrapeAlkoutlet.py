import pandas as pd
from selenium import webdriver
from datetime import datetime
import re
import math
import psycopg2
from selenium.webdriver.common.by import By
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Read data from Excel file
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="postgres",
    password="PC1",
    database="postgres"
)

# Read data from the PostgreSQL database
query = "SELECT \"Artikuls\", \"Nosaukums\", \"Barbora\", \"Lats\", \"Citro\", \"Rimi\" FROM web_preces_db WHERE \"Citro\" IS NOT NULL AND TRIM(\"Citro\") <> ''"
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
base_urls = [
    "https://ventspils.citro.lv/product-category/alkoholiskie-dzerieni/",
    "https://ventspils.citro.lv/product-category/augli-darzeni/",
    "https://ventspils.citro.lv/product-category/berniem/",
    "https://ventspils.citro.lv/product-category/dzerieni/",
    "https://ventspils.citro.lv/product-category/dzivniekiem/",
    "https://ventspils.citro.lv/product-category/galas-zivju-produkti/",
    "https://ventspils.citro.lv/product-category/garsvielas/",
    "https://ventspils.citro.lv/product-category/graudu-izstradajumi/",
    "https://ventspils.citro.lv/product-category/higienas-preces/",
    "https://ventspils.citro.lv/product-category/kafija-teja/",
    "https://ventspils.citro.lv/product-category/konditoreja/",
    "https://ventspils.citro.lv/product-category/konservejumi/",
    "https://ventspils.citro.lv/product-category/kulinarija/",
    "https://ventspils.citro.lv/product-category/maizes-izstradajumi-2/",
    "https://ventspils.citro.lv/product-category/piena-produkti-olas/",
    "https://ventspils.citro.lv/product-category/saimniecibas-preces/",
    "https://ventspils.citro.lv/product-category/saldejums/",
    "https://ventspils.citro.lv/product-category/saldeti-produkti/",
    "https://ventspils.citro.lv/product-category/saldumi-uzkodas/",
    "https://ventspils.citro.lv/product-category/sausas-zupas-buljoni/"
    # Add other URLs as needed
]

found_product_names = []
found_product_prices = []
found_product_artikuls = []  # Add a new list to store Artikuls
found_product_dates = []

total_products_not_found = 0
max_pages_per_category = 100
total_products_found_count = 0

# Get today's date in the format "DD/MM/YY"
today_date = datetime.now().strftime("%d/%m/%y")

# Extract Artikuls from the Excel file
product_names_in_db = df['Citro'].tolist()
artikuls_in_db = df['Artikuls'].tolist()

def is_nan_or_empty(value):
    return isinstance(value, float) and math.isnan(value)

for base_url in base_urls:
    title_match = re.search(r"https://ventspils.citro.lv/([^/]+)", base_url)
    title = title_match.group(1) if title_match else "Unknown"

    products_not_found = 0
    products_found_count = 0
    button_selector = "input.age_input"
    combined_selector = 'ins span.woocommerce-Price-amount.amount bdi, span.price > span.woocommerce-Price-amount.amount bdi'
    

    # Start the loop from 1, handle page 0 separately
    for page_number in range(1, max_pages_per_category + 1):
        # Adjust the URL construction based on the page_number
        if page_number == 1:
            url = base_url  # No need for "page/1" for the first page
        else:
            url = f"{base_url}page/{page_number}/"

        try:
            button = driver.find_element(By.CSS_SELECTOR, button_selector)
            button.click()
            print(f'Clicked the button with selector: {button_selector}')
        except:
            pass

        driver.get(url)
        price_elements = driver.find_elements(By.CSS_SELECTOR, combined_selector)
        if not price_elements:
            break

   
        

        scraped_product_names = [name_element.text.strip() for name_element in driver.find_elements(By.CSS_SELECTOR, "h2.woocommerce-loop-product__title")]

        # Extract prices directly from the parent of the price element using a more specific CSS selector
        scraped_product_prices = []
        for price_element in price_elements:
            parent_element = price_element.find_element(By.XPATH, "./..")  # Get the parent element
            scraped_product_prices.append(parent_element.text.strip().replace('€', ''))

        for scraped_name, scraped_price in zip(scraped_product_names, scraped_product_prices):
            scraped_name_cleaned = scraped_name.lower()

            # Check if the scraped name exactly matches any product name in the Excel file
            matching_products = [
                (product_name, artikul)
                for product_name, artikul in zip(product_names_in_db, artikuls_in_db)
                if not is_nan_or_empty(product_name) and scraped_name_cleaned == str(product_name).strip().lower()
            ]

            if matching_products:
                found_product_names.append(scraped_name)
                found_product_prices.append(scraped_price)
                found_product_artikuls.append(matching_products[0][1])  # Store the corresponding Artikuls
                found_product_dates.append(today_date)  
                print(
                    f'Product found in category "{title}" on page {page_number}: {scraped_name}, '
                    f'Price: {scraped_price}, Artikuls: {matching_products[0][1]}'
                )
                products_found_count += 1

    print(f'Products found in category "{title}": {products_found_count}')
    total_products_not_found += products_not_found
    total_products_found_count += products_found_count

   
# ... (rest of the code remains unchanged)

driver.quit()

print(f'===========================================================')
print(f'Total products found: {total_products_found_count}')
print(f'===========================================================')

# Create a DataFrame for found products with Product Name, Price, and Artikuls
# Create a DataFrame for found products with Product Name, Price, and Artikuls
found_products_df = pd.DataFrame({'Product Name3': found_product_names, 'Price3': found_product_prices, 'Artikuls3': found_product_artikuls, 'Date3': found_product_dates})

# Establish a connection to the PostgreSQL database
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="postgres",
    password="PC1",
    database="postgres"
)

# Define the table name where you want to insert the data
table_name = 'citro'
history_table_name = 'citro_history'

# Establish a connection to the database
cursor = conn.cursor()

try:
    # Iterate through the rows of the DataFrame and insert or update data in the database table
    for index, row in found_products_df.iterrows():
        values = tuple(row[column].replace(',', '.') if isinstance(row[column], str) else row[column] for column in found_products_df.columns)

        # Check if the product exists in the main table
        check_product_query = f"SELECT * FROM {table_name} WHERE \"Artikuls3\" = CAST(%s AS text)"
        logging.debug("SQL Query: %s", check_product_query)
        logging.debug("Query Parameters: %s", (values[found_products_df.columns.get_loc('Artikuls3')],))
        cursor.execute(check_product_query, (values[found_products_df.columns.get_loc('Artikuls3')],))
        existing_data = cursor.fetchone()

        if existing_data:
            tolerance = 0.001
            # Product exists in the main table
            existing_price = existing_data[3]
            existing_price = (existing_price,) if not isinstance(existing_price, tuple) else existing_price
            existing_price_float = float(existing_price[0])
            logging.debug("existing_price: %s", existing_price_float)
            logging.debug("existing_values: %s", values[found_products_df.columns.get_loc('Price3')])

            if abs(existing_price_float - float(values[found_products_df.columns.get_loc('Price3')].replace(',', '.'))) > tolerance:
                # Price has changed, save existing data to history
                insert_history_query = f"""
                    INSERT INTO {history_table_name} ("Artikuls3", "Product Name3", "Price3", "Date3")
                    VALUES (CAST(%s AS text), CAST(%s AS text), CAST(%s AS numeric), CAST(%s AS date))
                """
                cursor.execute(insert_history_query, existing_data[1:])
                logging.debug("prices are not SAME, inserted data in history")

                # Update the main table with the new data
                update_main_table_query = f"""
                    UPDATE {table_name}
                    SET "Price3" = %s, "Date3" = %s
                    WHERE "Artikuls3" = CAST(%s AS text)
                """
                cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('Price3')], values[found_products_df.columns.get_loc('Date3')], values[found_products_df.columns.get_loc('Artikuls3')]))

                logging.debug("Updated main table with new price for ID: %s", existing_data[0])
            else:
                logging.debug("prices are the same, skipping history insert for ID: %s", existing_data[0])
                update_main_table_query = f"""
                    UPDATE {table_name}
                    SET "Price3" = %s, "Date3" = %s
                    WHERE "Artikuls3" = CAST(%s AS text)
                """
                cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('Price3')], values[found_products_df.columns.get_loc('Date3')], values[found_products_df.columns.get_loc('Artikuls3')]))
        else:
            # Product not found in the main table, insert new data
            insert_query = f"""
                INSERT INTO {table_name} ({', '.join(['"' + col + '"' for col in found_products_df.columns])})
                VALUES ({', '.join(['%s' for _ in found_products_df.columns])})
            """
            cursor.execute(insert_query, values)
            logging.debug("Inserted new data into the main table for Artikuls: %s", values[found_products_df.columns.get_loc('Artikuls3')])

    # Commit the changes and close the connection
    conn.commit()
except Exception as e:
    conn.rollback()
    logging.error("Error: %s", e)
finally:
    cursor.close()
    conn.close()

logging.info("Data overwritten in the database successfully, and relevant data saved in the history table.")
