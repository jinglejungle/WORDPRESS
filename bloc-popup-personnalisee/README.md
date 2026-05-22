# Bloc WordPress avec Popup Personnalisée

## 📋 Description

Bloc WordPress personnalisé avec 5 liens et la possibilité de définir une popup personnalisée (titre + description optionnel) activable par switch pour chaque lien.

## 📁 Fichiers

- **block.json** - Configuration du bloc et ses attributs
- **edit.js** - Composant d'édition avec 5 switchs et champs de configuration
- **render.php** - Rendu front-end avec attributs `exit-data-popup-*`
- **index.js** - Point d'entrée du bloc
- **popup-handler.js** - Fonction globale pour gérer les popups
- **style.css** - Styles du bloc pour le front-end
- **editor.css** - Styles pour l'éditeur WordPress

## 🚀 Installation

1. Placez les fichiers dans le dossier de votre bloc WordPress
2. Le bloc doit être enregistré dans WordPress (voir `register_block_type`)

## 🎯 Utilisation

### 1. Configuration dans l'éditeur

- Entrez un **titre de popup** (optionnel)
- Entrez une **description de popup** (optionnel)
- Pour chaque lien, activez/désactivez le switch "Utiliser la popup personnalisée"
- Configurez le texte et l'URL de chaque lien

### 2. Intégration du script globale

Incluez `popup-handler.js` dans votre page :

```html
<script src="/chemin/vers/popup-handler.js"></script>
```

Ou enregistrez-le avec WordPress :

```php
wp_enqueue_script('popup-handler', get_template_directory_uri() . '/js/popup-handler.js', [], '1.0', true);
```

### 3. Configuration globale (optionnel)

Avant d'inclure `popup-handler.js`, vous pouvez définir les paramètres par défaut :

```javascript
window.globalPopupConfig = {
  title: 'Quitter le site',
  description: 'Vous allez être redirigé vers un site externe.'
};
```

## 🔧 Comment ça marche

### Structure HTML rendue

```html
<div class="mon-composant" 
     exit-data-popup-title="Mon titre personnalisé"
     exit-data-popup-description="Ma description personnalisée">
  
  <div class="bloc" 
       exit-data-link-id="1"
       exit-data-use-custom-popup="true">
    <a href="https://exemple.com" class="mon-lien">Lien 1</a>
  </div>
  
  <!-- ... autres liens ... -->
</div>
```

### Logique

1. **Click sur un lien** → Vérification si c'est un lien externe
2. **Si lien externe** :
   - Vérifie le switch `exit-data-use-custom-popup`
   - **Si ON** → Utilise le titre/description du composant
   - **Si OFF** → Utilise les paramètres globaux
3. **Affiche la popup** avec les paramètres appropriés

## 📝 Attributs du bloc

```json
{
  "popupTitle": "string - Titre de la popup personnalisée",
  "popupDescription": "string - Description de la popup personnalisée",
  "links": [
    {
      "id": "number - ID unique du lien",
      "url": "string - URL du lien",
      "text": "string - Texte affiché",
      "useCustomPopup": "boolean - Activer la popup personnalisée pour ce lien"
    }
  ]
}
```

## 🎨 Personnalisation

### Modifier la fonction `showPopup()`

Dans `popup-handler.js`, remplacez la fonction `showPopup()` pour intégrer votre logique de popup existante :

```javascript
function showPopup(title, description, url) {
  // Votre logique personnalisée ici
  // Exemples :
  // - Modal Bootstrap
  // - Dialog native
  // - Sweet Alert
  // - Lightbox
  // etc.
}
```

### Modifier les styles

- **Front-end** : Modifiez `style.css`
- **Éditeur** : Modifiez `editor.css`

## 📦 Attributs exit-data-popup

- `exit-data-popup-title` - Titre de la popup personnalisée
- `exit-data-popup-description` - Description de la popup personnalisée
- `data-exit-popup` - Boolean pour activer/désactiver la popup personnalisée

## ⚙️ Enregistrement du bloc

```php
register_block_type(__DIR__ . '/block.json');
```

Ou manuellement :

```php
register_block_type('mon-namespace/mon-bloc', [
    'render_callback' => function($attributes) {
        ob_start();
        include plugin_dir_path(__FILE__) . 'render.php';
        return ob_get_clean();
    }
]);
```

## 🐛 Dépannage

### Les switchs ne s'affichent pas
- Vérifiez que `block.json` est bien formé
- Vérifiez que `edit.js` est bien importé

### Les popups ne s'affichent pas
- Vérifiez que `popup-handler.js` est chargé
- Ouvrez la console F12 et vérifiez qu'il n'y a pas d'erreurs
- Vérifiez que les attributs `exit-data-*` sont présents dans le HTML

### Les liens ne sont pas reconnus comme externes
- Vérifiez le domaine dans la fonction `isExternalLink()`
- Vérifiez les URLs configurées

## 📞 Support

Pour toute question, consultez la documentation WordPress officielle sur les blocs personnalisés.
