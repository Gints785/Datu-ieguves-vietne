from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
# artikuls varchar(255), nosaukums varchar(255), barbora cena numeric(10,2),   barbora_datums timestamp,barbora akcija numeric(10,2),  barbora_datums_7 timestamp,
# Add a logger barbora_url varchar(255),
logger = logging.getLogger(__name__)
# Initialize the Firefox WebDriver prece id serial4
driver = webdriver.Firefox()

# URL of the webpage you want to scrape
url = 'https://alkoutlet.lv/vins-un-vina-dzerieni.html/'  # Replace with the actual URL

# Open the webpage
driver.get(url)

# Wait for the page to load (you may need to adjust the sleep time)
time.sleep(1)

# Find all product elements with their respective IDs
product_elements = driver.find_elements(By.CSS_SELECTOR, "div.product-item-info")

# Initialize a list to store product data
product_data = []
#logger.info(product_elements)
# Iterate over each product element
for product_element in product_elements:
    # Extract product name
    product_name_element = product_element.find_element(By.CSS_SELECTOR, "a.product-item-link")
    product_name = product_name_element.text.strip()
    
    discounted_price_element = product_element.find_elements(By.CSS_SELECTOR, "span.price")
            
    if discounted_price_element:
        discounted_price = discounted_price_element[0].text.strip().replace('€', '').replace(',', '.')
                
    else:
        discounted_price = ''
    if discounted_price == '':
        product_data.append(None)        
    else:                  
        product_data.append(product_name)
    
    
    # Extract the href attribute
    href_attribute = product_element.find_element(By.CSS_SELECTOR, "a").get_attribute("href")
    
    # Append the product data to the list
 
  
# Print the combined data
for index, product in enumerate(product_data, start=1):
    print(f"{index} {product}")

# Close the WebDriver
driver.quit()