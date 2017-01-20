package battery.email;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import pi4j.email.EmailSender;

public class EmailVoltage {
	private final static SimpleDateFormat SDF = new SimpleDateFormat("yyyy-MMM-dd HH:mm:ss");

	private static final BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

	/**
	 * Prompt the user for input, from stdin. Completed on [Return]
	 * @param prompt The prompt
	 * @return the user's input.
	 */
	public static String userInput(String prompt) {
		String retString = "";
		System.out.print(prompt);
		try {
			retString = stdin.readLine();
		} catch (Exception e) {
			System.out.println(e);
			String s;
			try {
				s = userInput("<Oooch/>");
			} catch (Exception exception) {
				exception.printStackTrace();
			}
		}
		return retString;
	}

	public static void main(String[] args)
	throws Exception {

		String providerSend = "google"; // default
		String sendTo = "";
		String[] dest = null;

		for (int i = 0; i < args.length; i++) {
			if ("-verbose".equals(args[i])) {
				System.setProperty("verbose", "true");
			} else if (args[i].startsWith("-send:"))
				providerSend = args[i].substring("-send:".length());
			else if (args[i].startsWith("-sendto:")) {
				sendTo = args[i].substring("-sendto:".length());
				dest = sendTo.split(",");
			} else if ("-help".equals(args[i])) {
				System.out.println("Usage:");
				System.out.println("  java battery.email.EmailVoltage -verbose -send:google -sendto:me@home.net,you@yourplace.biz -help");
				System.exit(0);
			}
		}
		if (dest == null || dest.length == 0 || dest[0].trim().length() == 0) {
			throw new RuntimeException("No destination email. Use the help (-help).");
		}

		final String[] destEmail = dest;
		final EmailSender sender = new EmailSender(providerSend);
		boolean go = true;
		System.out.println("Hit return to toggle the switch, Q to exit.");
		while (go) {
			String str = userInput("Voltage > ");
			if ("Q".equalsIgnoreCase(str)) {
				go = false;
				System.out.println("Bye.");
			} else {
				float data = Float.parseFloat(str);
				System.out.println("Sending");
				sender.send(destEmail,
								"PI Volt",
								"{ voltage: " + String.valueOf(data) + " }");
				System.out.println("Sent.");
			}
		}
	}
}
