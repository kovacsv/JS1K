import subprocess

def Check (command):
	result = subprocess.check_output (command, shell = True)
	print result
	print len (result)
	
Check ('java -jar ..\compiler\compiler.jar --js script.js')
