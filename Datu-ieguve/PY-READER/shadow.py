from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
import time

# Set up Firefox driver without specifying service
driver = webdriver.Firefox()

# Navigate to the URL
driver.get("https://alkoutlet.lv/vins-un-vina-dzerieni.html/")

# Define the number of retries
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

# Quit the driver
