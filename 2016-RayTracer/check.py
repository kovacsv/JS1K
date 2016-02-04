import os
import shutil
import subprocess
import re

def Minify (command):
	result = subprocess.check_output (command, shell = True)
	print result
	print len (result)
	return result

def WriteToFile (fileName, content):
	resultFile = open (fileName, 'wb')
	resultFile.write (content)
	resultFile.close ()
	
def WriteToShim (shimFileName, newShimFileName, scriptFileName):
	shutil.copy (shimFileName, newShimFileName)
	shimFile = open (newShimFileName, 'rb')
	shimContent = shimFile.read ()
	shimFile.close ()
	scriptFile = open (scriptFileName, 'rb')
	scriptContent = scriptFile.read ()
	scriptFile.close ()
	newShimFile = open (newShimFileName, 'wb')
	replaced = re.sub (r'(// THIS IS WHERE YOUR DEMO GOES).*(// END)', r'\1\n' + scriptContent + r'\2', shimContent, flags = re.DOTALL)
	newShimFile.write (replaced)
	newShimFile.close ()
	
scriptFile = 'script.js'
minScriptFile = 'script-min.js'
shimFileName = 'shim-original.html'
newShimFileName = 'shim-raytracer.html'
newShimMinFileName = 'shim-raytracer-min.html'

minified = Minify ('java -jar ..\compiler\compiler.jar --js ' + scriptFile)
WriteToFile (minScriptFile, minified)

WriteToShim (shimFileName, newShimFileName, scriptFile)
WriteToShim (shimFileName, newShimMinFileName, minScriptFile)
