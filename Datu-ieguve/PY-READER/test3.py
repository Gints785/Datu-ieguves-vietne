from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
import time

# Initialize the Firefox WebDriver
driver = webdriver.Firefox()

# URL of the webpage you want to scrape
url = 'https://alkoutlet.lv/vins-un-vina-dzerieni.html/'  # Replace with the actual URL

# Open the webpage
driver.get(url)

# Wait for the page to load (you may need to adjust the sleep time)
time.sleep(1)

# Specify the CSS selector for the element you want to scrape
selector = 'span.price-container span.price-wrapper span.price'

max_retries = 3
retry_delay = 3  # seconds

# Define function to find and click accept button
def find_and_click_accept():
    try:
        # Find the root element
        root = driver.find_element(By.ID, "usercentrics-root")
        
        # Get shadow root
        shadow = driver.execute_script('return arguments[0].shadowRoot', root)
        
        # Find all buttons matching the selector
        buttons = shadow.find_elements(By.CSS_SELECTOR, ".sc-dcJsrY.hNEXqu")
        
        # Click the second button
        if len(buttons) >= 2:
            buttons[1].click()
            return True
        else:
            return False
    except NoSuchElementException:
        return False

# Retry logic
for i in range(max_retries):
    if find_and_click_accept():
        break
    else:
        print("Accept button not found. Retrying...")
        time.sleep(retry_delay)
else:
    print("Max retries reached. Accept button not found.")



try:
    # Find all elements with the specified selector
    elements = driver.find_elements(By.CSS_SELECTOR, selector)
    
    print("Extracted Text:", elements)
    filtered_elements = []
    for element in elements:
        # Check if any ancestor of the element has the class 'old-price'
        print("Extracted Text:", element)
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
        print("Extracted Text:", ancestor_with_old_price)

        # If no ancestor has the class 'old-price', add the element to the filtered list
        if not ancestor_with_old_price:
            filtered_elements.append(element)
            
    # Check if elements are found
    if filtered_elements: 
        scraped_product_prices = [element.text.strip().replace('€', '') for element in filtered_elements]
            # Print the extracted text
        print("Extracted Text:", scraped_product_prices)

    else:
        print("No elements found with the specified selector.")

except Exception as e:
    # Print an error message if an exception occurs
    print(f'Error: {str(e)}')

finally:
    # Close the browser regardless of the outcome
    driver.quit()
