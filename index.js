import isDOMDocument from "is-dom-document";
import isDOMNode from "is-dom";
import isWindow from "is-window";



export default node =>
{
	if (!isDOMNode(node))
	{
		return false;
	}
	else if (isDOMDocument(node))
	{
		return !isWindow(node.defaultView);
	}
	else
	{
		return !node.ownerDocument.documentElement.contains(node);
	}
};
