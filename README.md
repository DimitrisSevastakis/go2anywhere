fuzzy_bookmarks
===============

This extension for chrome allows you to search through your bookmarks in a similar way to Sublime Text

By default, it searches through your bookmarks looking for a "fuzzy" match on 
the title of the bookmark and exact match on the url of the bookmark. 

Searching with the '@' symbol before your query it searches only for exact match on the title.
Searching with the '#' symbol before your query it searches only for exact match on the url.

(As this is still very early in development behaviour may change slightly, eg default search algorithm or symbol meaning)

If there is a tab already open with the same url of the bookmark, will bring that tab forth.

TODO:
The selection can now go out of sight, this will also be fixed.
