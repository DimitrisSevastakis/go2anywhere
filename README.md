Go2Anywhere
===============

This extension for chrome allows you to search through your bookmarks in a similar way to Sublime Text

By default, it searches through your bookmarks, tabs or history looking for a match on the title of the bookmark and exact match on the url of the bookmark.

Switch quickly between the tabs/bookmarks/history sections using ctrl+arrow keys.

To get quicker access to the extension assign a keyboard shortcut to it from the extensions settings page ("ctrl + p" for sublime fans) .

Searching with the '@' symbol before your query it searches only for exact match on the title. 
Searching with the '#' symbol before your query it searches only for exact match on the url.
Searching with the '>' symbol before your query it will search only for bookmarks that are under a folder that match the query (very useful). 

'Enter' opens the selected bookbark in a new tab and switching focus to that new tab.
'Shift + Enter' opens the selected bookmark in a new tab while maintaining the focus on the current tab.
'ctrl + a' Opens all search results in new tabs on the current window.
'Ctrl + Shift + a' Opens all search results in new tabs on a new window.

You can combine the last type of search in the following way:
Lets say you have a bookmark folder named "shopping" where you save all your shopping related stuff, and within that folder you have another folder named "cart"

'>shopping/cart | headphones' 
'>shopping cart | headphones' 
The two examples above are (almost) equivalent.They both return the bookmarks that are under the folder shopping/cart and has the word headphones in the title or url. In the case of the second example, the folder does not have to be a direct child of shopping, rather both of the words have to exist in the bookmark path.

Similarly :

'>shopping/cart | @headphones' 
'>shopping/cart | #ebay.com'

You can use the symbols mentioned above to do a search within a bookmark folder using just the title or just the url.


