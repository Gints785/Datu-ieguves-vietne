import subprocess
import os
import sys

# Directory containing the Python scripts
script_dir = "C:\\xampp\\htdocs\\Datu-ieguve\\PY-READER\\"

# Function to launch Python scripts sequentially
def launch_scripts(scripts):
    # Change the working directory to the script directory
    os.chdir(script_dir)

    for script in scripts:
        try:
            # Execute the Python script using subprocess.run()
            subprocess.run(["python", script], check=True)
            print(f"Script {script} executed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error executing script {script}: {e}")
            # Exit the loop if an error occurs
            break

# Execute the function to launch scripts sequentially
if __name__ == "__main__":
    # Get the list of scripts to execute from command-line arguments
    # The first argument (sys.argv[0]) is the script name, so we start from the second argument
    scripts_to_execute = sys.argv[1:]

    # Execute the function to launch scripts sequentially
    launch_scripts(scripts_to_execute)
