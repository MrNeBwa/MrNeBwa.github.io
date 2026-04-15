// Пример C++ файла для парсинга
// Парсер преобразует структуру функции в блок-схему

#include <iostream>
using namespace std;

// Пример 1: Простая последовательная функция
void processData() {
  cout << "Start processing" << endl;
  int x = 10;
  cout << "Initialize" << endl;
  x = x * 2;
  cout << "Calculate" << endl;
  cout << x << endl;
}

// Пример 2: Функция с условием
int checkValue(int value) {
  if (value > 0) {
    cout << "Positive" << endl;
    return 1;
  } else {
    cout << "Negative or zero" << endl;
    return 0;
  }
}

// Пример 3: Функция с циклом
void countNumbers(int limit) {
  for (int i = 0; i < limit; i++) {
    if (i % 2 == 0) {
      cout << "Even: " << i << endl;
    } else {
      cout << "Odd: " << i << endl;
    }
  }
  cout << "Done" << endl;
}

// Пример 4: Функция с switch
void selectOperation(int choice) {
  switch (choice) {
    case 1:
      cout << "Add" << endl;
      break;
    case 2:
      cout << "Subtract" << endl;
      break;
    default:
      cout << "Unknown operation" << endl;
  }
}

// Пример 5:複合 структура
int fibonacci(int n) {
  if (n <= 0) {
    return 0;
  } else if (n == 1) {
    return 1;
  } else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
}
