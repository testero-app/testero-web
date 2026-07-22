import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import 'highlight.js/styles/vs2015.css';

hljs.registerLanguage('java', java);

export default hljs;
