# 🔧 Парсинг C++ файлов - Гайд и решение проблем

## ❓ Проблемы с парсингом

Если при загрузке C++ файла ничего не происходит:

### 1. Проверьте формат функции
Парсер ищет функции со следующей структурой:

```cpp
// ✅ ПРАВИЛЬНО
void myFunction() {
  // Код
}

int getValue() {
  // Код
  return 0;
}

// ❌ НЕПРАВИЛЬНО
void my Function() { // Пробел в имени
}

void myFunction( ) { // Пробелы в скобках
}
```

### 2. Проверьте наличие скобок
```cpp
// ✅ РАБОТАЕТ
void process() {
  cout << "Start" << endl;
  int x = 5;
  cout << x << endl;
}

// ❌ НЕ РАБОТАЕТ (нет скобок)
void process;
```

### 3. Проверьте формат if/for/while
```cpp
// ✅ РАБОТАЕТ
if (x > 0) {
  cout << "Positive" << endl;
}

for (int i = 0; i < 10; i++) {
  cout << i << endl;
}

// ❌ МОЖЕТ НЕ РАБОТАТЬ
if(x>0)  // Заимствование скважинаinequality без пробелов
{
  cout << "test" << endl;
}
```

---

## 📝 Примеры парсируемого кода

### Пример 1: Простая последовательность
```cpp
void processData() {
  cout << "Loading" << endl;
  int value = 10;
  value = value * 2;
  cout << "Result: " << value << endl;
}
```

**Результат:**
```
START
   ↓
[Loading]
   ↓
[Assign value=10]
   ↓
[Multiply value*2]
   ↓
[Display result]
   ↓
END
```

### Пример 2: If-else условие
```cpp
int checkValue(int x) {
  if (x > 0) {
    cout << "Positive" << endl;
    return 1;
  } else {
    cout << "Negative" << endl;
    return 0;
  }
}
```

**Результат:**
```
     START
       ↓
    [x > 0?]
    /     \
  YES     NO
  ↓        ↓
[Positive][Negative]
  ↓        ↓
 return   return
```

### Пример 3: Цикл
```cpp
void loop() {
  for (int i = 0; i < 10; i++) {
    cout << i << endl;
  }
  cout << "Done" << endl;
}
```

**Результат:**
```
START
  ↓
[i = 0]
  ↓
[i < 10?]
/ \
↓   NO → [Done] → END
YES
 ↓
[cout i]
 ↓
[i++]
 ↓ (возврат в проверку)
```

---

## 🐛 Решение проблем

### Проблема 1: Функции не парсятся
**Причина:** Неправильный формат функции

**Решение:**
```cpp
// Убедитесь что есть:
// 1. Тип возврата (void, int, string и т.д.)
// 2. Имя функции
// 3. Скобки ()
// 4. Открывающая скобка { на одной строке или следующей

void myFunction() {  // ✅ Так хорошо
  // ...
}

void myFunction()
{  // ✅ И так тоже хорошо
  // ...
}
```

### Проблема 2: Только часть функции парсится
**Причина:** Парсер спотыкается на сложном синтаксисе

**Решение:** Используйте более простой синтаксис:
```cpp
// ✅ ПАРСИРУЕТСЯ
if (condition) {
  doSomething();
} else {
  doOther();
}

// ❌ МОЖЕТ НЕ ПАРСИРОВАТЬСЯ
if (condition) doSomething();
else doOther();
```

### Проблема 3: Парсер игнорирует некоторые строки
**Причина:** Строки без распознаваемых ключевых слов пропускаются

**Решение:**
```cpp
// ❌ Может быть пропущено
int x = getRandomValue();

// ✅ Будет замечено
if (isValid) {
  x = getRandomValue();
}
```

---

## 📊 Поддерживаемые конструкции

| Конструкция | Статус | Пример |
|---|---|---|
| if/else if/else | ✅ | `if (x > 0) { ... } else { ... }` |
| for loop | ✅ | `for (int i = 0; i < n; i++) { ... }` |
| while loop | ✅ | `while (x > 0) { ... }` |
| switch case | ✅ | `switch(x) { case 1: ... break; }` |
| Вложенные конструкции | ✅ | `if (...) { for (...) {...} }` |
| cout/cin | ✅ | Распознаются как операции ввода/вывода |
| Комментарии | ✅ | `// комментарий` и `/* ... */` |

---

## 🚀 Альтернативные решения

Если парсер по-прежнему не работает:

### Способ 1: Ручное создание блок-схемы
1. Используйте Sandbox
2. Добавляйте блоки вручную
3. Редактируйте свойства справа

### Способ 2: Упростите код
Создайте простой файл с минимальной структурой:
```cpp
void simple() {
  cout << "Start" << endl;
  if (condition) {
    cout << "Yes" << endl;
  }
  cout << "End" << endl;
}
```

### Способ 3: Используйте примеры
В папке проекта есть файл `PARSER_EXAMPLES.cpp` с примерами работающего кода.

---

## 📖 Диагностика

Чтобы помочь с отладкой парсера:

1. **Проверьте консоль браузера** (F12 → Console)
2. **Попробуйте с простым файлом** (`PARSER_EXAMPLES.cpp`)
3. **Скопируйте одну функцию** и попробуйте её

---

## 💡 Лучшие практики

```cpp
// ✅ ОПТИМАЛЬНО ДЛЯ ПАРСЕРА

#include <iostream>
using namespace std;

// Простые функции
void initialize() {
  cout << "Initializing" << endl;
}

int validate(int value) {
  if (value >= 0) {
    return 1;
  } else {
    return 0;
  }
}

void process(int count) {
  for (int i = 0; i < count; i++) {
    cout << "Processing " << i << endl;
  }
}

// Main
int main() {
  initialize();
  if (validate(10)) {
    process(5);
  }
  return 0;
}
```

---

**Если проблема персистирует:** Используйте ручное создание блоков в Sandbox или создайте Issue с примером файла, который не парсится.
