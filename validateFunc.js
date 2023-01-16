
function validate(eingabe){
	let valid = 0;
	let vEingabe;
	if(eingabe.includes("<") ||
	   eingabe.includes(">") ||
	   eingabe.includes("%") ||
	   eingabe.includes("/") ||
	   eingabe.includes("#") ||
	   eingabe.includes("\"")||
	   eingabe.includes(",") ||
	   eingabe.includes(".") ||
	   eingabe.includes("-") ||
	   eingabe.includes("_") ||
	   eingabe.includes("?") ||
	   eingabe.includes("!") ||
	   eingabe.includes(":") ||
	   eingabe.includes(";") ||
	   eingabe.includes("[") ||
	   eingabe.includes("]") ||
	   eingabe.includes("{") ||
	   eingabe.includes("}") ||
	   eingabe.includes("\\")||
	   eingabe.includes("(") ||
	   eingabe.includes(")") ||
	   eingabe.includes("$") ||
	   eingabe.includes("|") ||
	   eingabe.includes("+") ||
	   eingabe.includes("-") ||
	   eingabe.includes("*") ||
	   eingabe.includes("~") ||
	   eingabe.includes("=") ||
	   eingabe.includes(" ") ||
	   eingabe.includes("^"))
	{
	
		valid = -1;
	} else{
	
		valid = 1;
		vEingabe = eingabe;
		return vEingabe
	}
}

module.exports = {validate};
