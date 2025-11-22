import java.util.Scanner;
import java.util.Random;

public class RockPaperScissor {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Random rand = new Random();

        String[] choices = { "Rock", "Paper", "Scissor" };

        System.out.print("Enter your choice (Rock, Paper, Scissor): ");
        String userInput = sc.nextLine();
        String userChoice = normalizeChoice(userInput);

        if (userChoice == null) {
            System.out.println("Invalid choice. Please enter Rock, Paper, or Scissor.");
            sc.close();
            return;
        }

        int computerIndex = rand.nextInt(3);
        String computerChoice = choices[computerIndex];
        System.out.println("Computer chose: " + computerChoice);

        String result = decideWinner(userChoice, computerChoice);
        System.out.println(result);

        sc.close();
    }

    private static String normalizeChoice(String input) {
        if (input == null)
            return null;
        String s = input.trim().toLowerCase();
        switch (s) {
            case "rock":
                return "Rock";
            case "paper":
                return "Paper";
            case "scissor":
            case "scissors":
                return "Scissor";
            default:
                return null;
        }
    }

    private static String decideWinner(String userChoice, String computerChoice) {
        if (userChoice.equals(computerChoice)) {
            return "It's a tie!";
        }

        if ((userChoice.equals("Rock") && computerChoice.equals("Scissor")) ||
                (userChoice.equals("Paper") && computerChoice.equals("Rock")) ||
                (userChoice.equals("Scissor") && computerChoice.equals("Paper"))) {
            return "You win!";
        } else {
            return "Computer wins!";
        }
    }
}