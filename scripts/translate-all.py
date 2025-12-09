#!/usr/bin/env python3
"""
Translate i18n files from German to all configured languages
Creates complete, professional translations for all language files
Uses German as source template
"""

import json
from pathlib import Path

def save_json(filepath, data):
    """Save JSON file with proper formatting"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')

def translate_value(value, translations):
    """Translate a single string value"""
    if isinstance(value, str):
        # Replace each German phrase with translated version
        result = value
        for de_text, translated in sorted(translations.items(), key=lambda x: -len(x[0])):
            result = result.replace(de_text, translated)
        return result
    return value

def translate_structure(obj, translations):
    """Recursively translate all values in nested structure"""
    if isinstance(obj, dict):
        return {k: translate_structure(v, translations) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [translate_structure(item, translations) for item in obj]
    elif isinstance(obj, str):
        return translate_value(obj, translations)
    return obj

def get_translations():
    """Get all translation mappings from German to target languages"""
    return {
        'en': {
            # English translations from German
        'de': {
            # Actions
            'Continue now': 'Jetzt fortfahren',
            'Delete': 'Löschen',
            'Edit': 'Bearbeiten',
            'Load more': 'Mehr laden',
            'Profile': 'Profil',
            'Reset': 'Zurücksetzen',
            'View articles': 'Artikel anzeigen',
            'Cancel': 'Abbrechen',
            'Back': 'Zurück',
            'Home': 'Startseite',

            # App
            'A simple and efficient starting point': 'Ein einfacher und effizienter Ausgangspunkt',
            'Created by William Fontaine': 'Erstellt von Aleksandar Stajic',
            'Nuxt Boilerplate': 'Nuxt Boilerplate',

            # Common words
            'Email address': 'E-Mail-Adresse',
            'Password': 'Passwort',
            'Error': 'Fehler',
            'Sign in': 'Anmelden',
            'Sign up': 'Registrieren',
            'Login': 'Anmeldung',
            'Logout': 'Abmelden',
            'article': 'Artikel',
            'Article': 'Artikel',
            'articles': 'Artikel',

            # Auth
            'Back to login': 'Zurück zur Anmeldung',
            'Back to home': 'Zurück zur Startseite',
            'Forgot password': 'Passwort vergessen',
            'Reset your password': 'Passwort zurücksetzen',
            'Enter your email address': 'E-Mail-Adresse eingeben',
            'Enter your password': 'Passwort eingeben',
            'Remember your password?': 'Passwort wieder eingefallen?',
            'Send reset link': 'Reset-Link senden',

            # Validation
            'is not valid': 'ist ungültig',
            'cannot exceed': 'darf nicht überschreiten',
            'characters': 'Zeichen',
            'is required': 'ist erforderlich',
            'must be at least': 'muss mindestens',
            'characters long': 'Zeichen lang sein',
            'must contain at least': 'muss mindestens enthalten',

            # Categories
            'Categories': 'Kategorien',
            'All Articles': 'Alle Artikel',
            'Cached': 'Zwischengespeichert',
            'No articles found': 'Keine Artikel gefunden',
            'No articles found in this category': 'Keine Artikel in dieser Kategorie gefunden',
            'Loaded from cache': 'Aus Cache geladen',

            # Navigation
            'Back to Home': 'Zurück zur Startseite',
            'Previous Page': 'Vorherige Seite',
            'Next Page': 'Nächste Seite',
            'Page': 'Seite',

            # Language
            'Language': 'Sprache',
            'Switch to': 'Wechseln zu',
        },
        'sr': {
            # Serbian (Cyrillic)
            'Continue now': 'Настави сада',
            'Delete': 'Обриши',
            'Edit': 'Уреди',
            'Load more': 'Учитај више',
            'Profile': 'Профил',
            'Reset': 'Ресетуј',
            'View articles': 'Погледај чланке',
            'Cancel': 'Откажи',
            'Back': 'Назад',
            'Home': 'Почетна',

            'A simple and efficient starting point': 'Једноставна и ефикасна полазна тачка',
            'Created by William Fontaine': 'Креирао Александар Стајић',

            'Email address': 'Имејл адреса',
            'Password': 'Лозинка',
            'Error': 'Грешка',
            'Sign in': 'Пријави се',
            'Sign up': 'Региструј се',
            'Login': 'Пријава',
            'Logout': 'Одјава',
            'article': 'чланак',
            'Article': 'Чланак',
            'articles': 'чланака',

            'Categories': 'Категорије',
            'All Articles': 'Сви Чланци',
            'Cached': 'Кеширано',
            'No articles found': 'Нема пронађених чланака',
            'No articles found in this category': 'Нема чланака у овој категорији',
            'Loaded from cache': 'Учитано из кеша',

            'Back to Home': 'Назад на почетну',
            'Previous Page': 'Претходна страна',
            'Next Page': 'Следећа страна',
            'Page': 'Страна',

            'Language': 'Језик',
            'Switch to': 'Пребаци на',
        },
        'es': {
            # Spanish
            'Continue now': 'Continuar ahora',
            'Delete': 'Eliminar',
            'Edit': 'Editar',
            'Load more': 'Cargar más',
            'Profile': 'Perfil',
            'Reset': 'Restablecer',
            'View articles': 'Ver artículos',
            'Cancel': 'Cancelar',
            'Back': 'Atrás',
            'Home': 'Inicio',

            'A simple and efficient starting point': 'Un punto de partida simple y eficiente',
            'Created by William Fontaine': 'Creado por Aleksandar Stajic',

            'Email address': 'Dirección de correo electrónico',
            'Password': 'Contraseña',
            'Error': 'Error',
            'Sign in': 'Iniciar sesión',
            'Sign up': 'Registrarse',
            'Login': 'Inicio de sesión',
            'Logout': 'Cerrar sesión',
            'article': 'artículo',
            'Article': 'Artículo',
            'articles': 'artículos',

            'Categories': 'Categorías',
            'All Articles': 'Todos los Artículos',
            'Cached': 'En caché',
            'No articles found': 'No se encontraron artículos',
            'No articles found in this category': 'No se encontraron artículos en esta categoría',
            'Loaded from cache': 'Cargado desde caché',

            'Back to Home': 'Volver al Inicio',
            'Previous Page': 'Página Anterior',
            'Next Page': 'Página Siguiente',
            'Page': 'Página',

            'Language': 'Idioma',
            'Switch to': 'Cambiar a',
        },
        'fr': {
            # French
            'Continue now': 'Continuer maintenant',
            'Delete': 'Supprimer',
            'Edit': 'Modifier',
            'Load more': 'Charger plus',
            'Profile': 'Profil',
            'Reset': 'Réinitialiser',
            'View articles': 'Voir les articles',
            'Cancel': 'Annuler',
            'Back': 'Retour',
            'Home': 'Accueil',

            'A simple and efficient starting point': 'Un point de départ simple et efficace',
            'Created by William Fontaine': 'Créé par Aleksandar Stajic',

            'Email address': 'Adresse e-mail',
            'Password': 'Mot de passe',
            'Error': 'Erreur',
            'Sign in': 'Se connecter',
            'Sign up': 'S\'inscrire',
            'Login': 'Connexion',
            'Logout': 'Déconnexion',
            'article': 'article',
            'Article': 'Article',
            'articles': 'articles',

            'Categories': 'Catégories',
            'All Articles': 'Tous les Articles',
            'Cached': 'En cache',
            'No articles found': 'Aucun article trouvé',
            'No articles found in this category': 'Aucun article trouvé dans cette catégorie',
            'Loaded from cache': 'Chargé depuis le cache',

            'Back to Home': 'Retour à l\'Accueil',
            'Previous Page': 'Page Précédente',
            'Next Page': 'Page Suivante',
            'Page': 'Page',

            'Language': 'Langue',
            'Switch to': 'Passer à',
        },
        'it': {
            # Italian
            'Continue now': 'Continua ora',
            'Delete': 'Elimina',
            'Edit': 'Modifica',
            'Load more': 'Carica altro',
            'Profile': 'Profilo',
            'Reset': 'Ripristina',
            'View articles': 'Visualizza articoli',
            'Cancel': 'Annulla',
            'Back': 'Indietro',
            'Home': 'Home',

            'A simple and efficient starting point': 'Un punto di partenza semplice ed efficiente',
            'Created by William Fontaine': 'Creato da Aleksandar Stajic',

            'Email address': 'Indirizzo e-mail',
            'Password': 'Password',
            'Error': 'Errore',
            'Sign in': 'Accedi',
            'Sign up': 'Registrati',
            'Login': 'Accesso',
            'Logout': 'Disconnetti',
            'article': 'articolo',
            'Article': 'Articolo',
            'articles': 'articoli',

            'Categories': 'Categorie',
            'All Articles': 'Tutti gli Articoli',
            'Cached': 'In cache',
            'No articles found': 'Nessun articolo trovato',
            'No articles found in this category': 'Nessun articolo trovato in questa categoria',
            'Loaded from cache': 'Caricato dalla cache',

            'Back to Home': 'Torna alla Home',
            'Previous Page': 'Pagina Precedente',
            'Next Page': 'Pagina Successiva',
            'Page': 'Pagina',

            'Language': 'Lingua',
            'Switch to': 'Passa a',
        },
        'ru': {
            # Russian
            'Continue now': 'Продолжить сейчас',
            'Delete': 'Удалить',
            'Edit': 'Редактировать',
            'Load more': 'Загрузить еще',
            'Profile': 'Профиль',
            'Reset': 'Сбросить',
            'View articles': 'Просмотреть статьи',
            'Cancel': 'Отмена',
            'Back': 'Назад',
            'Home': 'Главная',

            'A simple and efficient starting point': 'Простая и эффективная отправная точка',
            'Created by William Fontaine': 'Создано Александром Стайичем',

            'Email address': 'Адрес электронной почты',
            'Password': 'Пароль',
            'Error': 'Ошибка',
            'Sign in': 'Войти',
            'Sign up': 'Зарегистрироваться',
            'Login': 'Вход',
            'Logout': 'Выход',
            'article': 'статья',
            'Article': 'Статья',
            'articles': 'статей',

            'Categories': 'Категории',
            'All Articles': 'Все Статьи',
            'Cached': 'Кэшировано',
            'No articles found': 'Статьи не найдены',
            'No articles found in this category': 'В этой категории нет статей',
            'Loaded from cache': 'Загружено из кэша',

            'Back to Home': 'Вернуться на главную',
            'Previous Page': 'Предыдущая страница',
            'Next Page': 'Следующая страница',
            'Page': 'Страница',

            'Language': 'Язык',
            'Switch to': 'Переключить на',
        }
    }

    def translate_recursive(obj, trans_map):
        """Recursively translate values in nested dict"""
        if isinstance(obj, dict):
            return {k: translate_recursive(v, trans_map) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [translate_recursive(item, trans_map) for item in obj]
        elif isinstance(obj, str):
            # Try to find and replace known phrases
            result = obj
            for en_phrase, translated in trans_map.items():
                result = result.replace(en_phrase, translated)
            return result
        else:
            return obj

    if lang_code not in translations:
        return en_data

    return translate_recursive(en_data, translations[lang_code])


def main():
    """Main translation process"""
    base_path = Path(__file__).parent.parent / 'i18n' / 'locales'

    # Load English source
    en_file = base_path / 'en' / 'common.json'
    with open(en_file, 'r', encoding='utf-8') as f:
        en_data = json.load(f)

    print("🌍 Starting translation process...")
    print(f"📖 Source: {en_file}\n")

    # Target languages
    languages = {
        'de': 'Deutsch',
        'sr': 'Српски',
        'es': 'Español',
        'fr': 'Français',
        'it': 'Italiano',
        'ru': 'Русский'
    }

    for lang_code, lang_name in languages.items():
        print(f"🔄 Translating to {lang_name} ({lang_code})...")

        # Get translation
        translated = get_translation(lang_code, en_data)

        # Save to file
        lang_path = base_path / lang_code
        lang_path.mkdir(parents=True, exist_ok=True)
        output_file = lang_path / 'common.json'

        save_json(output_file, translated)
        print(f"   ✅ Saved to {output_file}")

    print("\n✨ Translation completed successfully!")
    print(f"📝 Translated to {len(languages)} languages")


if __name__ == '__main__':
    main()
