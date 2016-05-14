file=$1;
compiledFile="${file}compiled.js";
echo $compiledFile
echo "trying to delete old compiled file"
if (rm "${compiledFile}") then
	echo "ok, deleted";
fi
cpp -P -undef -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C main.c > "${compiledFile}";
echo "Done."