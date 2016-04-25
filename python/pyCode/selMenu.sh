#!/bin/bash
#filename:SelMenu
echo "Please choose:(1-3,or ^c)"
echo "1 vi"
echo "2 X-window"
echo "3 print-file"
echo "4 Ctrl+c quit"
read choose
case $choose in
1) vi; exit 1;;
2) startx; exit 1;;
3) echo " //Please enter filename:"
	read filename
	lp $filename &
	exit 1;;
4) echo "--------------------"
	/bin/sh SelMenu.sh
esac
