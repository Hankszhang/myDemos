#!/bin/bash
#filename:VerifyFiles
FILENAME=
echo "Input file name:"
read FILENAME
if [ -L $FILENAME ]
	then
	mv $FILENAME /etc
fi
