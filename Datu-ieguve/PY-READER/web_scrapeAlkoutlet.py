import pandas as pd
import psycopg2
from selenium import webdriver
from datetime import datetime
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoSuchWindowException, InvalidSessionIdException
from selenium.webdriver.common.by import By
import signal
import subprocess
import sys
import time
import re
import math
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

# Add a logger
logger = logging.getLogger(__name__)
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
base_urls = [
    "https://alkoutlet.lv/vins-un-vina-dzerieni.html/",
    #"https://alkoutlet.lv/stiprie.html/",
    #"https://alkoutlet.lv/alus-sidri-kokteili.html/",
    #"https://alkoutlet.lv/bezalkoholiskie.html/",
    # Add other URLs as needed
]

total_products_found_count = 0

# Get today's date in the format "YYYY-MM-DD"
today_date = datetime.now()
today_date_str = today_date.strftime("%Y-%m-%d %H:%M:%S")

# Extract Artikuls from the PostgreSQL database
cursor = conn.cursor()

update_query = """
                UPDATE statuss
                SET button_state = false,
                    alkoutlet = 'status in-progress';
            """

# Execute the update query
cursor.execute(update_query)
conn.commit()

query = "SELECT \"artikuls\", \"nosaukums\", \"barbora\", \"lats\", \"citro\", \"rimi\", \"alkoutlet\" FROM web_preces_db WHERE \"alkoutlet\" IS NOT NULL AND TRIM(\"alkoutlet\") <> ''"
cursor.execute(query)
columns = [desc[0] for desc in cursor.description]
df = pd.DataFrame(cursor.fetchall(), columns=columns)

logger.info("Status is set to "'status in-progress'".")
cursor.close()

def is_nan_or_empty(value):
    return isinstance(value, float) and math.isnan(value)

# Lists to store found product details
found_product_names = []
found_product_prices = []
found_product_artikuls = []
found_product_dates = []
found_product_discount = []
found_product_url = []
found_product_dates_7 = []
filtered_elements = []
accept_button_clicked = False

def find_and_click_accept():
    global accept_button_clicked 
    try:
            # Find the root element
        root = driver.find_element(By.ID, "usercentrics-root")
                    
            # Get shadow root
        shadow = driver.execute_script('return arguments[0].shadowRoot', root)
                    
            # Find all buttons matching the selector
        buttons = shadow.find_elements(By.CSS_SELECTOR, ".sc-dcJsrY.hNEXqu")
                    
            # Click the second button if it exists
        if len(buttons) >= 2:
            buttons[1].click()
            logger.info("Clicked the accept button.")
            accept_button_clicked = True
            return True
        else:
            logger.warning("Accept button not found.")
            accept_button_clicked = False
            return False
    except NoSuchElementException:
        logger.warning("Accept button not found.")
        accept_button_clicked = False
        return False



for base_url in base_urls:
    title_match = re.search(r"https://www.alkoutlet.lv/([^/]+)", base_url)
    title = title_match.group(1) if title_match else "Unknown"
    
    
    


    for page_number in range(1, 100):  
       

        url = f"{base_url}?p={page_number}"
        driver.get(url)


        
        while not accept_button_clicked:
            accept_button_clicked = find_and_click_accept()


      
           
        try:
            price_elements = driver.find_elements("css selector", "span.price-container span.price-wrapper span.price")
            filtered_elements.clear()
            for element in price_elements:
                # Check if any ancestor of the element has the class 'old-price'
                
                ancestor_with_old_price = driver.execute_script("""
                    var el = arguments[0];
                    while (el.parentElement) {
                        el = el.parentElement;
                        if (el.classList.contains('old-price')) {
                            return true;
                        }
                    }
                    return false;
                """, element)
    
                # If no ancestor has the class 'old-price', add the element to the filtered list
                if not ancestor_with_old_price:
                    
                    filtered_elements.append(element)
                    
        except NoSuchWindowException:
            cursor = conn.cursor()
            update_query = """
                UPDATE statuss
                SET button_state = true,
                    alkoutlet = 'status dead';
            """
            cursor.execute(update_query) 
            print("Browsing context has been discarded. The browser window has been closed unexpectedly.")
            conn.commit()
            cursor.close()
        except InvalidSessionIdException:
            cursor = conn.cursor()
            update_query = """
                UPDATE statuss
                SET button_state = true,
                    alkoutlet = 'status dead';
            """
            cursor.execute(update_query) 
            print("WebDriver session does not exist or is not active.")
            conn.commit()
            cursor.close()
        

          
        product_elements = driver.find_elements("css selector", 'div.product-item-info[id^="product-item-info_"]')
        action = driver.find_elements("css selector", 'a.action.next')
        
        product_data = []
        product_url = []
    

        for url_element in product_elements:
           
            href_attribute = url_element.find_element("css selector", "a.product-item-link").get_attribute("href")
            product_url.append(href_attribute)
           
        for product_element in product_elements:
            discounted_price_element = product_element.find_elements("css selector", "span.old-price span.price-container span.price-wrapper span.price")
            
            if discounted_price_element:
                discounted_price = discounted_price_element[0].text.strip().replace('€', '').replace(',', '.')
                
            else:
                discounted_price = ''
            if discounted_price == '':
                product_data.append(None)
                  
            else:                  
                product_data.append(discounted_price)
      
        if not action:
            break
       
        scraped_product_names = [name_element.text.strip() for name_element in driver.find_elements("css selector", "a.product-item-link")]
       
   
        if filtered_elements:
            scraped_product_prices = [element.text.strip().replace('€', '').replace(',', '.') for element in filtered_elements]
          
        
        for scraped_name, scraped_price, scraped_discount, scraped_url in zip(scraped_product_names, scraped_product_prices , product_data, product_url):
            scraped_name_cleaned = scraped_name.lower()
            
            # Iterate directly over DataFrame rows
            for index, row in df.iterrows():
                product_name_cleaned = str(row['alkoutlet']).strip().lower()
               
                if not is_nan_or_empty(product_name_cleaned) and product_name_cleaned == scraped_name_cleaned:
                    # Extract only the numeric part of the price using regular expressions
                    price_match = re.search(r'(\d+\.\d+)', scraped_price)
                    
                    if price_match:
                        found_product_names.append(scraped_name)
                        found_product_prices.append(float(price_match.group(1)))  # Convert price to float
                        found_product_artikuls.append(row['artikuls'])  # Store the corresponding Artikuls
                        found_product_dates.append(today_date_str)  
                        found_product_discount.append(scraped_discount)
                        found_product_dates_7.append(today_date_str)  
                        found_product_url.append(scraped_url)   
                        print(f'Product found in category "{title}" on page {page_number}: {scraped_name}, alkoutlet_cena: {price_match.group(1)}, discounted_price: {scraped_discount}, artikuls: {row["artikuls"]}, URL: {scraped_url}')
                        total_products_found_count += 1
                        break  # Break the loop after finding a match
                    else:
                        print(f'Unable to extract price for product "{scraped_name}"')

# Close the browser table
driver.quit()

print(f'===========================================================')
print(f'Total products found: {total_products_found_count}')
print(f'===========================================================')

# Create a DataFrame for found products with Product Name, Price, and Artikuls
found_products_df = pd.DataFrame({'alkoutlet_nosaukums': found_product_names, 'alkoutlet_cena': found_product_prices, 'artikuls': found_product_artikuls, 'alkoutlet_datums': [today_date_str] * len(found_product_names), 'alkoutlet_akcija': found_product_discount,'alkoutlet_url': found_product_url, 'alkoutlet_datums_7': [today_date_str] * len(found_product_names) })

# Establish a connection to the PostgreSQL database
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="postgres",
    password="0000",
    database="postgres"
)

# Define the table name where you want to insert the data
table_name = 'alkoutlet'
history_table_name = 'alkoutlet_history'

# Establish a connection to the database
cursor = conn.cursor()

try:
    # Iterate through the rows of the DataFrame and insert or update data in the database tables
    for index, row in found_products_df.iterrows():
    # Convert date to string format before insertion into the database
        values = tuple(str(row[column]) if column == 'alkoutlet_cena' else row[column] for column in found_products_df.columns)
        values = list(values)  # Convert tuple to list to modify values
        values[found_products_df.columns.get_loc('alkoutlet_datums_7')] = row['alkoutlet_datums'] 
        values = tuple(values)
        # Check if the product exists in the main table
        check_product_query = f"SELECT * FROM {table_name} WHERE \"artikuls\" = CAST(%s AS text)"
        cursor.execute(check_product_query, (values[found_products_df.columns.get_loc('artikuls')],))
        existing_data = cursor.fetchone()

        if existing_data:
            existing_price = float(existing_data[2])
            new_price = float(values[found_products_df.columns.get_loc('alkoutlet_cena')].replace(',', '.'))

            existing_discount_str = existing_data[3]
            existing_discount = float(existing_discount_str) if existing_discount_str else 0.0


            
        

           
            if existing_price != new_price:
                # Price has changed, update both price and date
                update_main_table_query = f"""
                    UPDATE {table_name}
                    SET "alkoutlet_nosaukums" = %s, "alkoutlet_cena" = %s, "alkoutlet_datums" = %s, "alkoutlet_datums_7" = %s, alkoutlet_akcija = %s, alkoutlet_url = %s
                    WHERE "artikuls" = CAST(%s AS text)
                """
                cursor.execute(update_main_table_query, ( values[found_products_df.columns.get_loc('alkoutlet_nosaukums')], values[found_products_df.columns.get_loc('alkoutlet_cena')], values[found_products_df.columns.get_loc('alkoutlet_datums')],values[found_products_df.columns.get_loc('alkoutlet_datums_7')],values[found_products_df.columns.get_loc('alkoutlet_akcija')],values[found_products_df.columns.get_loc('alkoutlet_url')], values[found_products_df.columns.get_loc('artikuls')]))

                # Insert old row into history table
                insert_history_query = f"""
                    INSERT INTO {history_table_name} ("artikuls", "alkoutlet_nosaukums", "alkoutlet_cena", "alkoutlet_akcija","alkoutlet_datums")
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(insert_history_query, (values[found_products_df.columns.get_loc('artikuls')], values[found_products_df.columns.get_loc('alkoutlet_nosaukums')], values[found_products_df.columns.get_loc('alkoutlet_cena')],values[found_products_df.columns.get_loc('alkoutlet_akcija')] , values[found_products_df.columns.get_loc('alkoutlet_datums')]))    

                logger.info("Updated main table with new price and date, and inserted old data into history table.")
            else:
                # Prices are the same, update only the date
                update_date_query = f"""
                    UPDATE {table_name}
                    SET "alkoutlet_datums" = %s, alkoutlet_akcija = %s
                    WHERE "artikuls" = CAST(%s AS text)
                """
                cursor.execute(update_date_query, (values[found_products_df.columns.get_loc('alkoutlet_datums')], values[found_products_df.columns.get_loc('alkoutlet_akcija')], values[found_products_df.columns.get_loc('artikuls')]))

              


                logger.info("Prices are the same, updated only the date.")
        
    



        else:
            # Product not found in the main table, insert new data
            insert_query = f"""
                INSERT INTO {table_name} ({', '.join(['"' + col + '"' for col in found_products_df.columns])})
                VALUES ({', '.join(['%s' for _ in found_products_df.columns])})
            """
            try:
                cursor.execute(insert_query, values)
                logger.info("Inserted new data into the main table.")
            except Exception as e:
                logger.error(f"Error inserting into {table_name}: {e}")
                logger.error("Values causing the issue: %s", values)

          
            insert_history_query = f"""
                INSERT INTO {history_table_name} ("artikuls", "alkoutlet_nosaukums", "alkoutlet_cena", "alkoutlet_akcija","alkoutlet_datums")
                VALUES (%s, %s, %s, %s, %s)
            """
            try:
                cursor.execute(insert_history_query, (values[found_products_df.columns.get_loc('artikuls')], values[found_products_df.columns.get_loc('alkoutlet_nosaukums')], values[found_products_df.columns.get_loc('alkoutlet_cena')],values[found_products_df.columns.get_loc('alkoutlet_akcija')] , values[found_products_df.columns.get_loc('alkoutlet_datums')]))
                logger.info("Inserted new data into the history table.")
            except Exception as e:
                logger.error(f"Error inserting into {history_table_name}: {e}")
                logger.error("Values causing the issue: %s", values)
   
    update_query = """
    UPDATE statuss
    SET button_state = true,
        alkoutlet = 'status open';
    """
    cursor.execute(update_query)
    conn.commit()
    logger.info("Changes committed successfully.")
except NoSuchWindowException:
    logger.error("The browser window has been closed unexpectedly.")
    
    update_query = """
    UPDATE statuss
    SET button_state = true,
        alkoutlet = 'status dead';
    """
    cursor.execute(update_query) 
    conn.commit()  
except Exception as e:
    conn.rollback()
    logger.error("Error occurred during database operation: %s", e)
    logger.error("Values causing the issue: %s", values)
    logger.exception("Error details:")
    
    update_query = """
    UPDATE statuss
    SET button_state = true,
        alkoutlet = 'status dead';
    """
  
    cursor.execute(update_query) 
finally:
    
    cursor.close()
    conn.close()


logger.info("Data written to the database successfully.")