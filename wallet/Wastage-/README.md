# PaisaKid HTML Templates

## Files
- `parent_dashboard.html` — Parent view: wallet, controls, transactions, alerts
- `merchant_dashboard.html` — Merchant view: sales summary, payment form, recent sales
- `404.html` — 404 Not Found page
- `state.js` — Shared in-memory state & business logic (vanilla JS, no dependencies)

## Django Integration

### 1. Move to Django templates folder
Copy all `.html` files to your `templates/` directory and `state.js` to `static/js/`.

### 2. Add Django template tags to each HTML
At the top of each HTML file, add:
```html
{% load static %}
```

Change the `state.js` script tag from:
```html
<script src="state.js"></script>
```
to:
```html
<script src="{% static 'js/state.js' %}"></script>
```

### 3. Wire up URL routing
In `urls.py`:
```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),               # redirects to /parent
    path('parent/', views.parent_dashboard, name='parent_dashboard'),
    path('merchant/', views.merchant_dashboard, name='merchant_dashboard'),
]

handler404 = 'yourapp.views.custom_404'
```

In `views.py`:
```python
from django.shortcuts import render, redirect

def index(request):
    return redirect('parent_dashboard')

def parent_dashboard(request):
    return render(request, 'parent_dashboard.html')

def merchant_dashboard(request):
    return render(request, 'merchant_dashboard.html')

def custom_404(request, exception):
    return render(request, '404.html', status=404)
```

### 4. Replace inter-page links
Change hardcoded `.html` links in the `<nav>` to Django URL tags:
```html
<a href="{% url 'parent_dashboard' %}">Parent</a>
<a href="{% url 'merchant_dashboard' %}">Merchant</a>
```

### 5. Backend state (optional)
Currently `state.js` uses in-memory JS state (resets on page reload).
To persist state, replace the `topUp`, `processPayment`, etc. functions 
in `state.js` with `fetch()` calls to your Django REST API endpoints.

Example:
```javascript
async function topUp(amount) {
  const res = await fetch('/api/wallet/topup/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json();
  _state.balance = data.balance;
  notify();
}
```
