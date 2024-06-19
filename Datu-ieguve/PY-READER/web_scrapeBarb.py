import pandas as pd
from selenium import webdriver
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchWindowException, InvalidSessionIdException
import re
import psycopg2
import math
import time
import logging


conn = None  
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')


logger = logging.getLogger(__name__)

try:
    logger.info("Attempting to establish connection to the database...")
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="0000",
        database="postgres"
    )
    logger.info("Connection to the database established successfully.")
except Exception as e:
    logger.error("Error while establishing connection to the database: %s", e)


query = "SELECT \"id\", \"artikuls\", \"nosaukums\", \"barbora\", \"lats\", \"citro\", \"rimi\" FROM web_preces_db WHERE \"barbora\" IS NOT NULL AND TRIM(\"barbora\") <> ''"
cursor = conn.cursor()
update_query = """
                UPDATE statuss
                SET button_state = false,
                    barbora = 'status in-progress';
            """

cursor.execute(update_query)
conn.commit()
cursor.execute(query)



columns = [desc[0] for desc in cursor.description]
data = cursor.fetchall()
df = pd.DataFrame(data, columns=columns)


cursor.close()

driver = webdriver.Firefox()


base_urls = [
    "https://www.barbora.lv/piena-produkti-un-olas",
    "https://www.barbora.lv/augli-un-darzeni",
    "https://www.barbora.lv/maize-un-konditorejas-izstradajumi",
    "https://www.barbora.lv/gala-zivs-un-gatava-kulinarija",
    "https://www.barbora.lv/bakaleja",
    "https://www.barbora.lv/saldeta-partika",
    "https://www.barbora.lv/dzerieni",
    "https://www.barbora.lv/zidainu-un-bernu-preces",
    "https://www.barbora.lv/kosmetika-un-higiena",
    "https://www.barbora.lv/viss-tirisanai-un-majdzivniekiem",
    "https://www.barbora.lv/majai-un-atputai"
    
]

selector1 = '.tw-mr-0\\.5.tw-text-b-price-sm.tw-font-semibold.lg\\:tw-text-b-price-xl'
cents_selector = 'span.tw-text-b-price-xs.tw-font-semibold.lg\\:tw-text-b-price-lg'




found_product_names = []
found_product_prices = []
found_product_artikuls = []
found_product_id = []
found_product_dates = []
found_product_discount = []
found_product_url = []
found_product_dates_7 = []




total_products_not_found = 0
max_pages_per_category = float('inf')
total_products_found_count = 0

# Get today's date in the format "YYYY-MM-DD HH:MM:SS"
today_date = datetime.now()
today_date_str = today_date.strftime("%Y-%m-%d %H:%M:%S")

# Extract Artikuls from the Excel file
product_names_in_db = df['barbora'].tolist()
artikuls_in_db = df['artikuls'].tolist()
id_in_db = df['id'].tolist()





MAX_RETRIES = 2

WAIT_TIME = 10

retry_count = 0

while retry_count < MAX_RETRIES:
    try:
        for base_url in base_urls:
            title_match = re.search(r"https://www.barbora.lv/([^/]+)", base_url)
            if title_match:
                title = title_match.group(1)
            else:
                title = "Unknown"

            products_not_found = 0
            page_number = 1
            products_found_count = 0

            while True:
                try:
                    url = f"{base_url}?page={page_number}"
                    driver.get(url)
                    elements1 = driver.find_elements(By.CSS_SELECTOR, selector1)
                
                    cents_elements = driver.find_elements(By.CSS_SELECTOR, cents_selector)
                except NoSuchWindowException:
                        cursor = conn.cursor()
                        update_query = """
                            UPDATE statuss
                            SET button_state = true,
                                barbora = 'status dead';
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
                            barbora = 'status dead';
                    """
                    cursor.execute(update_query) 
                    print("WebDriver session does not exist or is not active.")
                    conn.commit()
                    cursor.close() 
            
            
                
                if not elements1 or not cents_elements:
                    break

                scraped_product_names = []
                scraped_product_prices = []
                scraped_product_akcijas = []
            
            
                for element1, cents_element in zip(elements1, cents_elements):
                    value1 = element1.text.strip()
                    cents_value = cents_element.text.strip()
                

                
                    matches1 = value1.split()

                    if len(matches1) >= 1:
                        whole_part = matches1[0]

                    
                        if len(cents_value) >= 1:
                            decimal_part = cents_value

                        
                            combined_value = f"{whole_part}.{decimal_part}"
                            scraped_product_prices.append(combined_value)
                        else:
                        
                            scraped_product_prices.append(whole_part)

                

            
                        
            

            
        
                while True:
                    try:
                        product_elements = driver.find_elements(By.CSS_SELECTOR, "[id^='fti-product-card-category-page-']")
                        product_url = []
                        product_data = []
                        for url_element in product_elements:

                            href_attribute = url_element.find_element(By.CSS_SELECTOR, "a").get_attribute("href")
                            product_url.append(href_attribute)
            
                    except NoSuchWindowException:
                        cursor = conn.cursor()
                        update_query = """
                            UPDATE statuss
                            SET button_state = true,
                                barbora = 'status dead';
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
                                barbora = 'status dead';
                        """
                        cursor.execute(update_query) 
                        print("WebDriver session does not exist or is not active.")
                        conn.commit()
                        cursor.close() 
                    

                    for product_element in product_elements:

                        discounted_price_element = product_element.find_elements("css selector", ".tw-flex.tw-flex-shrink-0.tw-flex-row.tw-mr-1 span.tw-text-b-paragraph-xs.tw-font-bold.tw-text-gray-400.lg\\:tw-text-b-paragraph-sm.tw-line-through")
                    
                        if discounted_price_element:
                            discounted_price = discounted_price_element[0].text.strip().replace('€', '').replace(',', '.')
                        else:
                            discounted_price = ''
                        if discounted_price == '':
                            product_data.append(None)
                        
                        else:
                        
                            product_data.append(discounted_price)
                    try:
                        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                        name_elements = driver.find_elements("css selector", "span.tw-block")
                        scraped_product_names.extend([name_element.text.strip() for name_element in name_elements])
                        logger.info(product_data)
                        
                        price_elements = driver.find_elements("css selector", "div.b-product-price-current")
                        scraped_product_prices.extend([float(price_element.text.strip().replace('€', '').replace(',', '.')) for price_element in price_elements])
                    except NoSuchWindowException:
                        cursor = conn.cursor()
                        update_query = """
                            UPDATE statuss
                            SET button_state = true,
                                barbora = 'status dead';
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
                                barbora = 'status dead';
                        """
                        cursor.execute(update_query) 
                        print("WebDriver session does not exist or is not active.")
                        conn.commit()
                        cursor.close()
            
                
            
                    if not driver.find_elements("css selector", "a.pagination-next") or len(found_product_names) == len(scraped_product_names):
                        break

                for scraped_name, scraped_price, scraped_discount, scraped_url in zip(scraped_product_names, scraped_product_prices, product_data,product_url):
                
            
                    scraped_name_cleaned = scraped_name.lower()

                    # Check if the scraped name exists in database the product names, and the product name is not empty or NaN
                    for product_name, artikul, ids in zip(product_names_in_db, artikuls_in_db, id_in_db):
                        if product_name:
                            product_name_cleaned = str(product_name).strip().lower()

                            if product_name_cleaned in scraped_name_cleaned:
                                found_product_names.append(scraped_name)
                                found_product_prices.append(f'{scraped_price}')
                                found_product_artikuls.append(artikul)
                                found_product_id.append(ids)
                                found_product_dates_7.append(today_date_str)  
                                found_product_discount.append(scraped_discount)
                                found_product_url.append(scraped_url)    
                                found_product_dates.append(today_date_str)  
                                
                                logger.info(f'Product found in category "{title}" on page {page_number}: {product_name}, barbora_cena: {scraped_price}, discounted_price: {scraped_discount}, artikuls: {artikul}, URL: {scraped_url}')
                                products_found_count += 1
                                break
                    else:
                        products_not_found += 1

                if len(found_product_names) == len(scraped_product_names) or page_number >= max_pages_per_category:
                    break

                page_number += 1

            logger.info(f'Products found in category "{title}": {products_found_count}')
            total_products_not_found += products_not_found
            total_products_found_count += products_found_count

        driver.quit()

        logger.info(f'===========================================================')
        logger.info(f'Total products found: {total_products_found_count}')
        logger.info(f'===========================================================')


        found_products_df = pd.DataFrame({'barbora_nosaukums': found_product_names, 'barbora_cena': found_product_prices, 'barbora_datums': [today_date_str] * len(found_product_names), 'barbora_datums_7': [today_date_str] * len(found_product_names), 'barbora_akcija': found_product_discount,'barbora_url': found_product_url, 'web_preces_id': found_product_id , 'artikuls': found_product_artikuls })
        print(found_products_df)  

        table_name = 'barbora'
        history_table_name = 'barbora_history'


        cursor = conn.cursor()

        try:
        
            for index, row in found_products_df.iterrows():
        
                
                values = tuple(str(row[column]) if column == 'barbora_cena' else row[column] for column in found_products_df.columns)
                values = list(values)  
                values[found_products_df.columns.get_loc('barbora_datums_7')] = row['barbora_datums']  
                values = tuple(values)

                check_product_query = f"SELECT * FROM {table_name} WHERE \"artikuls\" = CAST(%s AS text)"
                cursor.execute(check_product_query, (values[found_products_df.columns.get_loc('artikuls')],))
                existing_data = cursor.fetchone()
                
                if existing_data:
                    existing_price = float(existing_data[2])
                    new_price = float(values[found_products_df.columns.get_loc('barbora_cena')].replace(',', '.'))

                
                    existing_discount_str = existing_data[3]
                
                    existing_discount = float(existing_discount_str) if existing_discount_str else 0.0

                    
                    
                    
                    if existing_price != new_price:
            
                        update_main_table_query = f"""
                            UPDATE {table_name}
                            SET "barbora_nosaukums" = %s, "barbora_cena" = %s, "barbora_datums" = %s, "barbora_datums_7" = %s, "barbora_akcija" = %s, "barbora_url" = %s
                            WHERE "artikuls" = CAST(%s AS text)
                        """
                        cursor.execute(update_main_table_query, (values[found_products_df.columns.get_loc('barbora_nosaukums')], values[found_products_df.columns.get_loc('barbora_cena')], values[found_products_df.columns.get_loc('barbora_datums')],values[found_products_df.columns.get_loc('barbora_datums_7')],values[found_products_df.columns.get_loc('barbora_akcija')],values[found_products_df.columns.get_loc('barbora_url')], values[found_products_df.columns.get_loc('artikuls')]))

                    
                        insert_history_query = f"""
                            INSERT INTO {history_table_name} ("artikuls", "barbora_nosaukums", "barbora_cena", "barbora_datums", "barbora_akcija")
                            VALUES (%s, %s, %s, %s, %s)
                        """
                        cursor.execute(insert_history_query, (values[found_products_df.columns.get_loc('artikuls')], values[found_products_df.columns.get_loc('barbora_nosaukums')], values[found_products_df.columns.get_loc('barbora_cena')], values[found_products_df.columns.get_loc('barbora_datums')], values[found_products_df.columns.get_loc('barbora_akcija')]))

                        logger.info("Updated main table with new price and date, and inserted old data into history table.")
                    else:
                
                        update_date_query = f"""
                            UPDATE {table_name}
                            SET "barbora_datums" = %s, barbora_akcija = %s
                            WHERE "artikuls" = CAST(%s AS text)
                        """
                        cursor.execute(update_date_query, (values[found_products_df.columns.get_loc('barbora_datums')], values[found_products_df.columns.get_loc('barbora_akcija')], values[found_products_df.columns.get_loc('artikuls')]))

                    


                        logger.info("Prices are the same, updated only the date.")
                



                else:
        
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
                        INSERT INTO {history_table_name} ("artikuls", "barbora_nosaukums", "barbora_cena", "barbora_datums", "barbora_akcija")
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    try:
                        cursor.execute(insert_history_query, (values[found_products_df.columns.get_loc('artikuls')], values[found_products_df.columns.get_loc('barbora_nosaukums')], values[found_products_df.columns.get_loc('barbora_cena')], values[found_products_df.columns.get_loc('barbora_datums')], values[found_products_df.columns.get_loc('barbora_akcija')]))
                        logger.info("Inserted new data into the history table.")
                    except Exception as e:
                        logger.error(f"Error inserting into {history_table_name}: {e}")
                        logger.error("Values causing the issue: %s", values)
                        
            update_query = """
            UPDATE statuss
            SET button_state = true,
                barbora = 'status open';
            """
            cursor.execute(update_query)

            conn.commit()
            logger.info("Changes committed successfully.")
        except Exception as e:
            conn.rollback()
            logger.error("Error occurred during database operation: %s", e)
            logger.error("Values causing the issue: %s", values)
            logger.exception("Error details:")
            update_query = """
                UPDATE statuss
                SET barbora = 'status dead';
            """
        
            cursor.execute(update_query)
        finally:
            cursor.close()
            conn.close()

        logger.info("Data written to the database successfully.")
        break
    except Exception as e:
        # Log the exception
        logger.error(f"An error occurred: {str(e)}")

        # Increment the retry count
        retry_count += 1

        # If maximum retries reached, log an error and exit the loop
        if retry_count >= MAX_RETRIES:
            logger.error("Maximum retries reached. Exiting script.")
            cursor = conn.cursor()
            update_query = """
                            UPDATE statuss
                            SET button_state = true,
                                rimi = 'status dead';
                        """
            cursor.execute(update_query)
            conn.commit()
            driver.quit()
            break

        # Wait for a specified time before retrying
        logger.info(f"Waiting for {WAIT_TIME} seconds before retrying...")
        time.sleep(WAIT_TIME)