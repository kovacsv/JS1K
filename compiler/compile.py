import sys
import os
import shutil
import subprocess
import re

def Minify (scriptFile):
	command = 'java -jar compiler.jar --js ' + scriptFile
	result = subprocess.check_output (command, shell = True)
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

currentPath = os.path.dirname (os.path.abspath (__file__))
os.chdir (currentPath)
	
scriptFile = os.path.abspath (sys.argv[1])
originalShim = os.path.abspath (sys.argv[2])

minified = Minify (scriptFile)
print minified
print len (minified)

destFolder = os.path.join (os.path.dirname (scriptFile), 'build')
if not os.path.exists (destFolder):
	os.makedirs (destFolder)

minScriptFile = os.path.join (destFolder, 'script-min.js')
WriteToFile (minScriptFile, minified)
WriteToShim (originalShim, os.path.join (destFolder, 'shim-result.html'), scriptFile)
WriteToShim (originalShim, os.path.join (destFolder, 'shim-result-min.html'), minScriptFile)
