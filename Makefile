dispatch: dispatch.cpp
	g++ -std=c++17 -O2 -Wall -o dispatch dispatch.cpp
test: dispatch
	printf '27.6710 85.3188\nr1 27.6800 85.3200\nr2 27.7172 85.3240\n' | ./dispatch | grep -q '^r1 '
clean:
	rm -f dispatch
